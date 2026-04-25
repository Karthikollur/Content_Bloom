import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSignedReadUrl } from '@/lib/supabase/storage'
import { transcribeAudio } from '@/lib/ai/deepgram'

export const maxDuration = 60

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TRANSCRIBABLE_TYPES = new Set(['audio', 'video'])

function parseAssetId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const id = (payload as { assetId?: unknown }).assetId
  return typeof id === 'string' && UUID_REGEX.test(id) ? id : null
}

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assetId = parseAssetId(await request.json().catch(() => null))
  if (!assetId) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: asset, error: loadError } = await supabase
    .from('assets')
    .select('id, user_id, source_type, source_url, status')
    .eq('id', assetId)
    .single()

  if (loadError || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  if (!TRANSCRIBABLE_TYPES.has(asset.source_type)) {
    return NextResponse.json(
      { error: 'Asset is not audio/video' },
      { status: 400 }
    )
  }

  if (!asset.source_url) {
    return NextResponse.json({ error: 'Asset has no source path' }, { status: 400 })
  }

  await supabase
    .from('assets')
    .update({ status: 'transcribing', error_message: null })
    .eq('id', assetId)

  try {
    const signedUrl = await getSignedReadUrl(supabase, asset.source_url)
    const { transcript, durationSeconds, costUsd } = await transcribeAudio(signedUrl)

    await supabase
      .from('assets')
      .update({
        transcript,
        duration_seconds: durationSeconds,
        status: 'generating',
      })
      .eq('id', assetId)

    await supabase.from('usage_logs').insert({
      user_id: user.id,
      asset_id: assetId,
      action: 'transcribe',
      api_provider: 'deepgram',
      cost_usd: costUsd,
    })

    void fireGenerate(request, assetId)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transcription failed'
    await supabase
      .from('assets')
      .update({ status: 'failed', error_message: message })
      .eq('id', assetId)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function fireGenerate(request: Request, assetId: string): Promise<void> {
  try {
    const origin = new URL(request.url).origin
    const cookie = request.headers.get('cookie') ?? ''
    await fetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify({ assetId }),
    })
  } catch {
    // Generate route runs independently; failures surface via asset.status.
  }
}

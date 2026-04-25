import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/ai/claude'
import type { Platform } from '@/types/database'

export const maxDuration = 60

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TARGET_PLATFORMS: ReadonlyArray<Extract<Platform, 'linkedin' | 'twitter' | 'newsletter'>> = [
  'linkedin',
  'twitter',
  'newsletter',
]
const MIN_TRANSCRIPT_CHARS = 50

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
    .select('id, user_id, transcript, status')
    .eq('id', assetId)
    .single()

  if (loadError || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const transcript = asset.transcript ?? ''
  if (transcript.trim().length < MIN_TRANSCRIPT_CHARS) {
    await supabase
      .from('assets')
      .update({ status: 'failed', error_message: 'Transcript too short to generate content' })
      .eq('id', assetId)
    return NextResponse.json({ error: 'Transcript too short' }, { status: 400 })
  }

  const { data: brandVoice } = await supabase
    .from('brand_voices')
    .select('voice_description, example_content')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  const results = await Promise.allSettled(
    TARGET_PLATFORMS.map((platform) =>
      generateContent({
        transcript,
        platform,
        brandVoice: brandVoice?.voice_description ?? undefined,
        exampleContent: brandVoice?.example_content ?? undefined,
      })
    )
  )

  const outputRows = results.flatMap((result, index) => {
    if (result.status !== 'fulfilled') return []
    const platform = TARGET_PLATFORMS[index]
    return [
      {
        asset_id: assetId,
        user_id: user.id,
        platform,
        content: result.value.content,
        version: 1,
        is_edited: false,
      },
    ]
  })

  const usageRows = results.map((result, index) => ({
    user_id: user.id,
    asset_id: assetId,
    action: `generate_${TARGET_PLATFORMS[index]}`,
    api_provider: 'anthropic',
    tokens_used: result.status === 'fulfilled' ? result.value.tokensUsed : null,
    cost_usd: result.status === 'fulfilled' ? result.value.costUsd : null,
  }))

  if (outputRows.length > 0) {
    await supabase.from('outputs').insert(outputRows)
  }
  await supabase.from('usage_logs').insert(usageRows)

  const allFailed = outputRows.length === 0
  const failureMessage = allFailed
    ? results
        .map((r) => (r.status === 'rejected' ? (r.reason as Error)?.message ?? 'unknown' : null))
        .filter(Boolean)
        .join('; ') || 'All generations failed'
    : null

  await supabase
    .from('assets')
    .update({
      status: allFailed ? 'failed' : 'complete',
      error_message: failureMessage,
    })
    .eq('id', assetId)

  return NextResponse.json({
    success: !allFailed,
    generated: outputRows.length,
    failed: TARGET_PLATFORMS.length - outputRows.length,
  })
}

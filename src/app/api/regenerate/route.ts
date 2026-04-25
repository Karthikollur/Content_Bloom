import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/ai/claude'
import { isInsufficientSource } from '@/lib/ai/source-check'
import type { Platform } from '@/types/database'

export const maxDuration = 60

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REGENERABLE_PLATFORMS = new Set<Platform>(['linkedin', 'twitter', 'newsletter'])
const MIN_TRANSCRIPT_CHARS = 50

interface RegenerateRequest {
  assetId: string
  platform: Extract<Platform, 'linkedin' | 'twitter' | 'newsletter'>
}

function parseRequest(payload: unknown): RegenerateRequest | null {
  if (!payload || typeof payload !== 'object') return null
  const { assetId, platform } = payload as { assetId?: unknown; platform?: unknown }
  if (typeof assetId !== 'string' || !UUID_REGEX.test(assetId)) return null
  if (typeof platform !== 'string' || !REGENERABLE_PLATFORMS.has(platform as Platform)) return null
  return { assetId, platform: platform as RegenerateRequest['platform'] }
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

  const parsed = parseRequest(await request.json().catch(() => null))
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { assetId, platform } = parsed

  const { data: asset, error: loadError } = await supabase
    .from('assets')
    .select('id, user_id, transcript')
    .eq('id', assetId)
    .single()

  if (loadError || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const transcript = asset.transcript ?? ''
  if (transcript.trim().length < MIN_TRANSCRIPT_CHARS) {
    return NextResponse.json({ error: 'Transcript too short' }, { status: 400 })
  }

  const { data: brandVoice } = await supabase
    .from('brand_voices')
    .select('voice_description, example_content')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  const { data: existing } = await supabase
    .from('outputs')
    .select('version')
    .eq('asset_id', assetId)
    .eq('platform', platform)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = (existing?.[0]?.version ?? 0) + 1

  try {
    const { content, tokensUsed, costUsd } = await generateContent({
      transcript,
      platform,
      brandVoice: brandVoice?.voice_description ?? undefined,
      exampleContent: brandVoice?.example_content ?? undefined,
    })

    if (isInsufficientSource(content)) {
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        asset_id: assetId,
        action: `regenerate_${platform}`,
        api_provider: 'anthropic',
        tokens_used: tokensUsed,
        cost_usd: costUsd,
      })
      return NextResponse.json(
        { error: 'Source content insufficient to regenerate', insufficient: true },
        { status: 422 }
      )
    }

    const { data: inserted, error: insertError } = await supabase
      .from('outputs')
      .insert({
        asset_id: assetId,
        user_id: user.id,
        platform,
        content,
        version: nextVersion,
        is_edited: false,
      })
      .select()
      .single()

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'Failed to insert output')
    }

    await supabase.from('usage_logs').insert({
      user_id: user.id,
      asset_id: assetId,
      action: `regenerate_${platform}`,
      api_provider: 'anthropic',
      tokens_used: tokensUsed,
      cost_usd: costUsd,
    })

    return NextResponse.json({ success: true, output: inserted })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Regenerate failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

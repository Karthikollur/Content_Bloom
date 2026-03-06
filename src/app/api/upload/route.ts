import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/utils/constants'

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request
    const body = await request.json()
    const { title, sourceType, content, sourceUrl } = body

    if (!title || !sourceType) {
      return NextResponse.json({ error: 'Title and source type are required' }, { status: 400 })
    }

    // 3. Check plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, assets_used_this_month')
      .eq('id', user.id)
      .single()

    if (profile) {
      const limit = PLAN_LIMITS[profile.plan]
      if (profile.assets_used_this_month >= limit.assetsPerMonth) {
        return NextResponse.json(
          { error: 'Monthly asset limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    }

    // 4. Create asset record
    const { data: asset, error: insertError } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        title,
        source_type: sourceType,
        source_url: sourceUrl || null,
        transcript: sourceType === 'text' ? content : null,
        status: 'uploaded',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Asset insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
    }

    // 5. Increment usage counter
    await supabase.rpc('increment_assets_used', { user_id: user.id })

    return NextResponse.json({ success: true, data: { assetId: asset.id } })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}

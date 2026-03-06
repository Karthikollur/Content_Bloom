import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assets, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Assets fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: assets })
  } catch (error) {
    console.error('Assets route error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

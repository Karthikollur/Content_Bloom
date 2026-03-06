import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow all requests through without auth
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set(name, value)
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(name, value, options as Record<string, string>)
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set(name, '')
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(name, '', options as Record<string, string>)
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect unauthenticated users trying to access dashboard
    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup') &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      request.nextUrl.pathname !== '/'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (
      user &&
      (request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup'))
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    // If Supabase client fails (e.g. invalid credentials), allow request through
    return NextResponse.next({ request })
  }
}

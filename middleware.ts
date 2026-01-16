import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // Routes publiques
  const publicRoutes = [
    '/', 
    '/register', 
    '/login', 
    '/forgot-password',
    '/shop',
    '/about',
    '/contact'
  ]
  
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith('/listing/') ||
                        pathname.startsWith('/api/')
  
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Si pas connecté → Login
  if (!user && !pathname.startsWith('/login')) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // Si connecté, vérifier le statut
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    // ADMINS → Ne PAS rediriger automatiquement, ils peuvent aller partout
    // On retire la redirection automatique vers /admin
    
    // USERS normaux
    if (profile?.role !== 'admin') {
      // Si profil incomplet → /onboarding
      if (profile?.status === 'incomplete' && !pathname.startsWith('/onboarding')) {
        const url = new URL('/onboarding', request.url)
        return NextResponse.redirect(url)
      }

      // Si en attente → /dashboard/pending
      if (profile?.status === 'pending' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pending')) {
        const url = new URL('/dashboard/pending', request.url)
        return NextResponse.redirect(url)
      }

      // Si validé et sur /dashboard/pending → /dashboard
      if (profile?.status === 'validated' && pathname.startsWith('/dashboard/pending')) {
        const url = new URL('/dashboard', request.url)
        return NextResponse.redirect(url)
      }

      // Si rejeté → /dashboard/rejected
      if (profile?.status === 'rejected' && !pathname.startsWith('/dashboard/rejected')) {
        const url = new URL('/dashboard/rejected', request.url)
        return NextResponse.redirect(url)
      }

      // Si suspendu → /dashboard/suspended
      if (profile?.status === 'suspended' && !pathname.startsWith('/dashboard/suspended')) {
        const url = new URL('/dashboard/suspended', request.url)
        return NextResponse.redirect(url)
      }

      // Bloquer l'accès à /admin pour les non-admins
      if (pathname.startsWith('/admin')) {
        const url = new URL('/dashboard', request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
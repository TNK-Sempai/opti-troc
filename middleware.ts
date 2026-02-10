import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

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

  // getUser() valide le token côté serveur ET rafraîchit le JWT si expiré
  const { data: { user } } = await supabase.auth.getUser()

  // Redirection qui préserve les cookies Supabase (tokens rafraîchis)
  function redirectTo(path: string) {
    const url = new URL(path, request.url)
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Routes publiques
  const publicRoutes = [
    '/',
    '/register',
    '/register/success',
    '/login',
    '/forgot-password',
    '/shop',
    '/about',
    '/contact',
    '/want-to-buy',
  ]

  const isPublicRoute = publicRoutes.includes(pathname) ||
                        pathname.startsWith('/listing/') ||
                        pathname.startsWith('/legal/') ||
                        pathname.startsWith('/api/')

  if (isPublicRoute) {
    return supabaseResponse
  }

  // Si pas connecté → Login
  if (!user && !pathname.startsWith('/login')) {
    return redirectTo('/login')
  }

  // Si connecté, vérifier le statut et le rôle
  if (user) {
    // Utiliser le service role pour bypasser les RLS
    // (le client anon peut échouer si les policies bloquent la lecture)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    // ADMINS → peuvent aller partout, pas de redirection
    if (profile?.role !== 'admin') {
      // Si profil incomplet → /onboarding
      if (profile?.status === 'incomplete' && !pathname.startsWith('/onboarding')) {
        return redirectTo('/onboarding')
      }

      // Si en attente → /dashboard/pending
      if (profile?.status === 'pending' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pending')) {
        return redirectTo('/dashboard/pending')
      }

      // Si validé et sur /dashboard/pending → /dashboard
      if (profile?.status === 'validated' && pathname.startsWith('/dashboard/pending')) {
        return redirectTo('/dashboard')
      }

      // Si rejeté → /dashboard/rejected
      if (profile?.status === 'rejected' && !pathname.startsWith('/dashboard/rejected')) {
        return redirectTo('/dashboard/rejected')
      }

      // Si suspendu → /dashboard/suspended
      if (profile?.status === 'suspended' && !pathname.startsWith('/dashboard/suspended')) {
        return redirectTo('/dashboard/suspended')
      }

      // Bloquer l'accès à /admin pour les non-admins
      if (pathname.startsWith('/admin')) {
        return redirectTo('/dashboard')
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

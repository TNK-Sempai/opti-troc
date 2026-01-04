import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // 1. Mettre à jour la session Supabase
  const response = await updateSession(request)
  
  const pathname = request.nextUrl.pathname

  // 2. Vérifier si l'utilisateur est connecté
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Routes publiques (pas de vérification)
  const publicRoutes = ['/', '/register', '/login', '/forgot-password']
  if (publicRoutes.includes(pathname)) {
    return response
  }

  // 4. Si pas connecté et route protégée → Login
  if (!user && !pathname.startsWith('/login')) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // 5. Si connecté, vérifier le statut du profil
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    // Si profil incomplet et pas sur /onboarding → Rediriger
    if (profile?.status === 'incomplete' && !pathname.startsWith('/onboarding')) {
      const url = new URL('/onboarding', request.url)
      return NextResponse.redirect(url)
    }

    // Si profil en attente et pas sur /dashboard/pending → Rediriger
    if (profile?.status === 'pending' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pending')) {
      const url = new URL('/dashboard/pending', request.url)
      return NextResponse.redirect(url)
    }

    // Si profil validé et sur /dashboard/pending → Rediriger vers dashboard
    if (profile?.status === 'validated' && pathname.startsWith('/dashboard/pending')) {
      const url = new URL('/dashboard', request.url)
      return NextResponse.redirect(url)
    }

    // Si profil rejeté et pas sur /dashboard/rejected → Rediriger
    if (profile?.status === 'rejected' && !pathname.startsWith('/dashboard/rejected')) {
      const url = new URL('/dashboard/rejected', request.url)
      return NextResponse.redirect(url)
    }

    // Si profil suspendu et pas sur /dashboard/suspended → Rediriger
    if (profile?.status === 'suspended' && !pathname.startsWith('/dashboard/suspended')) {
      const url = new URL('/dashboard/suspended', request.url)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
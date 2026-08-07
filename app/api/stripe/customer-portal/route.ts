import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { logError } from '@/lib/logger'
import { rateLimit, getClientIp, tooManyRequestsMessage } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // 3 ouvertures de portail / 10 min : chaque appel crée une session Stripe.
    const ip = getClientIp(req.headers)
    const limit = rateLimit(`customer-portal:${ip}`, 3, 10 * 60 * 1000)

    if (!limit.success) {
      return NextResponse.json(
        { error: tooManyRequestsMessage(limit.retryAfterSeconds) },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard/profil`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    logError('POST /api/stripe/customer-portal', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ouverture du portail de facturation' },
      { status: 500 }
    )
  }
}

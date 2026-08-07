import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { logError } from '@/lib/logger'

const PLAN_PRICES: Record<string, string | undefined> = {
  early_bird: process.env.STRIPE_PRICE_EARLY_BIRD,
  mensuel: process.env.STRIPE_PRICE_MENSUEL,
  annuel: process.env.STRIPE_PRICE_ANNUEL,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const plan: string = body.plan

    if (!['early_bird', 'mensuel', 'annuel'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const priceId = PLAN_PRICES[plan]
    if (!priceId || priceId.startsWith('price_REPLACE')) {
      return NextResponse.json(
        { error: 'Configuration du plan manquante. Contactez le support.' },
        { status: 500 }
      )
    }

    // Vérifier le statut et les infos du profil
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('status, subscription_status, is_early_adopter, vat_number, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile || !['incomplete', 'awaiting_payment'].includes(profile.status)) {
      return NextResponse.json(
        { error: 'Statut invalide pour le paiement' },
        { status: 403 }
      )
    }

    // Un abonnement existant interdit d'en créer un second : le contrôle de
    // `status` ci-dessus ne suffit pas, il reste à 'awaiting_payment' tant que
    // le webhook n'a pas basculé le compte.
    if (profile.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif.' },
        { status: 400 }
      )
    }

    if (profile.subscription_status === 'past_due') {
      return NextResponse.json(
        {
          error:
            'Un problème de paiement existe sur votre abonnement. Gérez-le depuis votre profil.',
        },
        { status: 400 }
      )
    }

    // Early Bird: vérifier l'éligibilité
    if (plan === 'early_bird') {
      if (!profile.is_early_adopter) {
        return NextResponse.json(
          { error: "L'offre Early Bird n'est plus disponible pour votre compte" },
          { status: 403 }
        )
      }

      // 1 early bird par numéro de TVA (sauf groupes multi-boutiques — is_group non implémenté)
      if (profile.vat_number) {
        const { data: existingSubscribers } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('vat_number', profile.vat_number)
          .eq('subscription_status', 'active')
          .neq('id', user.id)
          .limit(1)

        if (existingSubscribers && existingSubscribers.length > 0) {
          return NextResponse.json(
            {
              error:
                'Une boutique de votre groupe bénéficie déjà de l\'offre Early Bird. Choisissez une autre formule.',
            },
            { status: 403 }
          )
        }
      }
    }

    // Créer ou réutiliser le Stripe Customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/inscription/annule`,
      metadata: { userId: user.id, plan },
      subscription_data: {
        metadata: { userId: user.id, plan },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    logError('POST /api/stripe/create-checkout-session', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { rateLimit, getClientIp, tooManyRequestsMessage } from '@/lib/rate-limit'
import { hasActiveSubscription, ACCESS_SUBSCRIPTION_STATUSES } from '@/lib/subscription'

/**
 * Tarifs envoyés à Stripe par plan, dans l'ordre des line_items.
 * Early Bird = abonnement annuel (avec essai, voir EARLY_BIRD_TRIAL_DAYS)
 * + tarif ponctuel de 3 € payé immédiatement sur la première facture.
 */
const PLAN_PRICES: Record<string, (string | undefined)[]> = {
  early_bird: [process.env.STRIPE_PRICE_ANNUEL, process.env.STRIPE_PRICE_EARLY_BIRD_FEE],
  mensuel: [process.env.STRIPE_PRICE_MENSUEL],
  annuel: [process.env.STRIPE_PRICE_ANNUEL],
}

/** Essai Early Bird avant le premier prélèvement annuel. */
const EARLY_BIRD_TRIAL_DAYS = 90

function isConfiguredPrice(priceId: string | undefined): priceId is string {
  return !!priceId && !priceId.startsWith('price_REPLACE')
}

const LOG_CONTEXT = '[POST /api/stripe/create-checkout-session]'

/**
 * Trace chaque refus : sans ça, un utilisateur bloqué avant Stripe ne laisse
 * aucune trace en production (logError y est silencieux).
 */
function logRejection(
  status: number,
  reason: string,
  ctx: { userId?: string | null; plan?: string | null; ip?: string }
) {
  console.error(`${LOG_CONTEXT} Refus ${status}`, {
    status,
    reason,
    userId: ctx.userId ?? null,
    plan: ctx.plan ?? null,
    ip: ctx.ip,
  })
}

export async function POST(req: NextRequest) {
  let userId: string | null = null
  let plan: string | null = null

  try {
    // 3 sessions / 10 min : créer une session Stripe est coûteux et une
    // rafale produit des abonnements en double.
    const ip = getClientIp(req.headers)
    const limit = rateLimit(`checkout:${ip}`, 3, 10 * 60 * 1000)

    if (!limit.success) {
      logRejection(429, 'rate_limit', { ip })
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
      logRejection(401, 'non_authentifie', { ip })
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    userId = user.id

    const body = await req.json()
    plan = body.plan

    if (!plan || !['early_bird', 'mensuel', 'annuel'].includes(plan)) {
      logRejection(400, 'plan_invalide', { userId, plan })
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const priceIds = PLAN_PRICES[plan]
    if (!priceIds.every(isConfiguredPrice)) {
      logRejection(500, 'price_id_manquant', { userId, plan })
      return NextResponse.json(
        { error: 'Configuration du plan manquante. Contactez le support.' },
        { status: 500 }
      )
    }

    // Vérifier le statut et les infos du profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('status, subscription_status, is_early_adopter, vat_number, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile || !['incomplete', 'awaiting_payment'].includes(profile.status)) {
      logRejection(403, profile ? `statut_invalide:${profile.status}` : 'profil_introuvable', {
        userId,
        plan,
      })
      if (profileError) {
        console.error(`${LOG_CONTEXT} Lecture du profil échouée`, {
          userId,
          code: profileError.code,
          message: profileError.message,
        })
      }
      return NextResponse.json(
        { error: 'Statut invalide pour le paiement' },
        { status: 403 }
      )
    }

    // Un abonnement existant interdit d'en créer un second : le contrôle de
    // `status` ci-dessus ne suffit pas, il reste à 'awaiting_payment' tant que
    // le webhook n'a pas basculé le compte.
    // active et trialing ici, past_due juste en dessous (message dédié) :
    // les trois refusent un second abonnement.
    if (hasActiveSubscription(profile.subscription_status)) {
      logRejection(400, 'abonnement_deja_actif', { userId, plan })
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif.' },
        { status: 400 }
      )
    }

    if (profile.subscription_status === 'past_due') {
      logRejection(400, 'abonnement_past_due', { userId, plan })
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
        logRejection(403, 'early_bird_non_eligible', { userId, plan })
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
          .in('subscription_status', [...ACCESS_SUBSCRIPTION_STATUSES])
          .neq('id', user.id)
          .limit(1)

        if (existingSubscribers && existingSubscribers.length > 0) {
          logRejection(403, 'early_bird_tva_deja_utilisee', { userId, plan })
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

    const isEarlyBird = plan === 'early_bird'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: priceIds.map((price) => ({ price, quantity: 1 })),
      mode: 'subscription',
      success_url: `${appUrl}/inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/inscription/annule`,
      metadata: { userId: user.id, plan },
      subscription_data: {
        metadata: { userId: user.id, plan },
        ...(isEarlyBird ? { trial_period_days: EARLY_BIRD_TRIAL_DAYS } : {}),
      },
      // Pas de code promo sur l'Early Bird : il ramènerait les 3 € à 0.
      allow_promotion_codes: !isEarlyBird,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    // console.error et non logError : ce dernier est silencieux en production.
    const err = error as { type?: string; code?: string; statusCode?: number; message?: string }
    console.error(`${LOG_CONTEXT} Exception (500)`, {
      status: 500,
      reason: 'exception',
      userId,
      plan,
      stripeType: err?.type,
      stripeCode: err?.code,
      stripeStatus: err?.statusCode,
      message: err?.message ?? String(error),
    })
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}

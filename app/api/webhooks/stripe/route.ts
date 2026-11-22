import { NextRequest, NextResponse, after } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logError, logInfo } from '@/lib/logger'
import { notifyAdminNewUser } from '@/lib/notifications/discord'

export const runtime = 'nodejs'

type ProfileUpdate = {
  subscription_status?: string | null
  subscription_id?: string | null
  status?: string
}

/**
 * Écrit sur user_profiles et lève en cas d'échec : le catch global renvoie
 * alors 500 et Stripe rejoue l'événement. Une écriture ratée et acquittée
 * laisserait la base désynchronisée de Stripe sans aucune reprise.
 */
async function updateProfile(
  match: { column: 'id' | 'subscription_id'; value: string },
  update: ProfileUpdate,
  context: string
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq(match.column, match.value)
    .select('id')

  if (error) {
    console.error(`[stripe-webhook.${context}] Échec écriture user_profiles`, {
      [match.column]: match.value,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(`[${context}] update user_profiles failed: ${error.message}`)
  }

  // Pas une erreur (pas de rejeu) : l'événement peut précéder l'écriture du
  // subscription_id, ou concerner un abonnement inconnu. On le trace seulement.
  if (!data || data.length === 0) {
    console.error(`[stripe-webhook.${context}] Aucun profil correspondant`, {
      [match.column]: match.value,
    })
  }
}

/**
 * Depuis l'API basil (SDK 22), Invoice n'a plus de champ `subscription` :
 * l'identifiant est sous parent.subscription_details.subscription.
 */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription
  if (!sub) return null
  return typeof sub === 'string' ? sub : sub.id
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    logError('stripe-webhook.constructEvent', err)
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        if (!userId) {
          logError('stripe-webhook', 'checkout.session.completed missing userId in metadata')
          break
        }

        logInfo('stripe-webhook', `checkout.session.completed userId=${userId} plan=${plan}`)

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null

        if (subscriptionId) {
          // Vrai statut Stripe (active, trialing, incomplete…) plutôt que
          // 'active' en dur. Un échec de lecture lève → 500 → rejeu.
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          await updateProfile(
            { column: 'id', value: userId },
            {
              subscription_status: subscription.status,
              subscription_id: subscriptionId,
              status: 'pending', // Passe en attente de validation admin
            },
            'checkout.session.completed'
          )
        } else {
          // Ne devrait pas arriver en mode 'subscription'. Le paiement est
          // confirmé : on fait avancer le compte sans inventer de statut.
          console.error(
            '[stripe-webhook.checkout.session.completed] Session sans abonnement',
            { userId, sessionId: session.id, mode: session.mode }
          )

          await updateProfile(
            { column: 'id', value: userId },
            { status: 'pending' },
            'checkout.session.completed'
          )
        }

        // Le compte vient de passer en 'pending' : les admins ont quelque chose
        // à valider. after() garde la latence Discord hors de la réponse à
        // Stripe, qui coupe au bout de ~10 s et rejouerait l'événement.
        after(() => notifyAdminNewUser({ userId, plan }))

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) break

        // Statut Stripe tel quel : past_due n'est plus écrasé par 'inactive'.
        await updateProfile(
          { column: 'id', value: userId },
          {
            subscription_status: subscription.status,
            subscription_id: subscription.id,
          },
          'customer.subscription.updated'
        )

        logInfo('stripe-webhook', `subscription.updated userId=${userId} status=${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await updateProfile(
            { column: 'id', value: userId },
            { subscription_status: 'inactive' },
            'customer.subscription.deleted'
          )

          logInfo('stripe-webhook', `subscription.deleted userId=${userId}`)
        } else {
          // Fallback: match by subscription_id
          await updateProfile(
            { column: 'subscription_id', value: subscription.id },
            { subscription_status: 'inactive' },
            'customer.subscription.deleted'
          )
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = getInvoiceSubscriptionId(invoice)

        if (subId) {
          await updateProfile(
            { column: 'subscription_id', value: subId },
            { subscription_status: 'past_due' },
            'invoice.payment_failed'
          )

          logInfo('stripe-webhook', `invoice.payment_failed subscriptionId=${subId}`)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = getInvoiceSubscriptionId(invoice)

        if (subId) {
          // Une relance réussie ramène l'abonnement à 'active'. On relit le
          // statut chez Stripe plutôt que d'écrire 'active' en dur : une
          // facture payée pendant un essai (frais ponctuels) laisse
          // l'abonnement en 'trialing'.
          const subscription = await stripe.subscriptions.retrieve(subId)

          await updateProfile(
            { column: 'subscription_id', value: subId },
            { subscription_status: subscription.status },
            'invoice.paid'
          )

          logInfo('stripe-webhook', `invoice.paid subscriptionId=${subId} status=${subscription.status}`)
        }
        break
      }

      default:
        logInfo('stripe-webhook', `Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    // console.error et non logError : ce dernier est silencieux en production
    // (lib/logger.ts), or un 500 sans trace est indébuggable côté Vercel.
    console.error(
      `[stripe-webhook.handler] event=${event.type} id=${event.id}`,
      error
    )
    // 500 → Stripe rejoue l'événement. Un échec d'écriture DB laissait sinon
    // un client débité bloqué en 'awaiting_payment' sans aucune reprise.
    return NextResponse.json(
      { error: 'Webhook handler failed', eventId: event.id },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logError, logInfo } from '@/lib/logger'

export const runtime = 'nodejs'

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
          typeof session.subscription === 'string' ? session.subscription : null

        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_status: 'active',
            subscription_id: subscriptionId,
            status: 'pending', // Passe en attente de validation admin
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (error) {
          logError('stripe-webhook.updateProfile', error)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) break

        const isActive = ['active', 'trialing'].includes(subscription.status)

        await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_status: isActive ? 'active' : 'inactive',
            subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        logInfo('stripe-webhook', `subscription.updated userId=${userId} status=${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_status: 'inactive',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          logInfo('stripe-webhook', `subscription.deleted userId=${userId}`)
        } else {
          // Fallback: match by subscription_id
          await supabaseAdmin
            .from('user_profiles')
            .update({ subscription_status: 'inactive', updated_at: new Date().toISOString() })
            .eq('subscription_id', subscription.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId =
          typeof invoice.subscription === 'string' ? invoice.subscription : null

        if (subId) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subId)

          logInfo('stripe-webhook', `invoice.payment_failed subscriptionId=${subId}`)
        }
        break
      }

      default:
        logInfo('stripe-webhook', `Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    logError('stripe-webhook.handler', error)
    // Return 200 to avoid Stripe retrying — log and investigate separately
  }

  return NextResponse.json({ received: true })
}

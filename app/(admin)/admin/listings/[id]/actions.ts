'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { logError } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY!)

/** Le titre et la raison sont saisis par des humains : on échappe avant injection HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Suspend un listing (admin seulement)
 */
export async function suspendListing(listingId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Récupéré avant l'update pour connaître le propriétaire à prévenir.
  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select('user_id, title')
    .eq('id', listingId)
    .single()

  const { error } = await supabaseAdmin
    .from('listings')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspended_by: auth.userId
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Notification non bloquante : la suspension est déjà appliquée.
  if (listing?.user_id) {
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        listing.user_id
      )
      const recipientEmail = authUser?.user?.email

      if (recipientEmail) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        const supportEmail = process.env.EMAIL_FROM ?? 'contact@opti-troc.com'

        await resend.emails.send({
          from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
          to: recipientEmail,
          subject: 'Votre annonce a été suspendue sur Opti-Troc',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 20px 0; }
                .notice { background: #fff7ed; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c; }
                .cta-box { text-align: center; margin: 28px 0; }
                .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="color: #1a2332;">Votre annonce a été suspendue</h1>
                </div>

                <p>Bonjour,</p>
                <p>
                  Votre annonce${listing.title ? ` <strong>${escapeHtml(listing.title)}</strong>` : ''}
                  a été temporairement retirée de la marketplace Opti-Troc par notre
                  équipe de modération.
                </p>

                <div class="notice">
                  <strong>Cette suspension est temporaire.</strong><br>
                  Votre annonce n'est pas supprimée : elle est simplement masquée le temps
                  que notre équipe termine ses vérifications. Elle peut être remise en
                  ligne une fois la situation clarifiée.
                </div>

                <p>
                  Pour comprendre le motif de cette suspension ou demander une remise en
                  ligne, écrivez-nous à
                  <a href="mailto:${supportEmail}">${supportEmail}</a> — nous vous
                  répondrons dans les meilleurs délais.
                </p>

                <div class="cta-box">
                  <a href="${appUrl}/dashboard/listings" class="cta">Voir mes annonces</a>
                </div>

                <div class="footer">
                  <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
                </div>
              </div>
            </body>
            </html>
          `,
        })
      }
    } catch (emailError) {
      logError('suspendListing.email', emailError)
    }
  }

  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${listingId}`)

  return { success: true }
}

/**
 * Réactive un listing suspendu (admin seulement)
 */
export async function reactivateListing(listingId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('listings')
    .update({ 
      status: 'active',
      suspended_at: null,
      suspended_by: null
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${listingId}`)
  
  return { success: true }
}

/**
 * Bannit définitivement un listing (admin seulement)
 */
export async function banListing(listingId: string, reason?: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Récupéré avant l'update pour connaître le propriétaire à prévenir.
  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select('user_id, title')
    .eq('id', listingId)
    .single()

  const { error } = await supabaseAdmin
    .from('listings')
    .update({
      status: 'banned',
      banned_at: new Date().toISOString(),
      banned_by: auth.userId,
      ban_reason: reason
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Notification du propriétaire — non bloquante : le bannissement est déjà
  // appliqué, un échec d'email ne doit pas le faire remonter comme une erreur.
  if (listing?.user_id) {
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        listing.user_id
      )
      const recipientEmail = authUser?.user?.email

      if (recipientEmail) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        await resend.emails.send({
          from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
          to: recipientEmail,
          subject: 'Votre annonce a été suspendue',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 20px 0; }
                .reason { background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
                .cta-box { text-align: center; margin: 28px 0; }
                .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="color: #1a2332;">Votre annonce a été suspendue</h1>
                </div>

                <p>Bonjour,</p>
                <p>
                  Votre annonce${listing.title ? ` <strong>${escapeHtml(listing.title)}</strong>` : ''}
                  a été retirée de la marketplace Opti-Troc par notre équipe de modération.
                </p>

                <div class="reason">
                  <strong>Motif :</strong><br>
                  ${reason ? escapeHtml(reason) : 'Non-respect des conditions d\'utilisation de la plateforme.'}
                </div>

                <p>
                  Si vous pensez qu'il s'agit d'une erreur, répondez à cet email ou
                  écrivez-nous à
                  <a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a>.
                </p>

                <div class="cta-box">
                  <a href="${appUrl}/dashboard/listings" class="cta">Voir mes annonces</a>
                </div>

                <div class="footer">
                  <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
                </div>
              </div>
            </body>
            </html>
          `,
        })
      }
    } catch (emailError) {
      logError('banListing.email', emailError)
    }
  }

  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${listingId}`)

  return { success: true }
}

/**
 * Supprime un listing (admin seulement)
 */
export async function deleteListing(listingId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('listings')
    .delete()
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/listings')
  
  return { success: true }
}
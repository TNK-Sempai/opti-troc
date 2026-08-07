'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

/** Le motif est saisi librement par un admin : on échappe avant injection HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Valide un utilisateur en attente (admin seulement)
 */
export async function validateUser(userId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      status: 'validated',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Email de bienvenue — non bloquant : la validation est déjà enregistrée,
  // un échec d'envoi ne doit pas la faire remonter comme une erreur à l'admin.
  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name, is_early_adopter')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const recipientEmail = authUser?.user?.email

    if (recipientEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: '✅ Votre compte Opti-Troc est validé !',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; background: #22c55e; color: white; border-radius: 8px; margin-bottom: 20px; }
              .button { display: inline-block; background: #1a2332; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .promo-box { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ Compte validé !</h1>
              </div>

              <p>Bonjour ${profile?.first_name || profile?.contact_name || ''},</p>
              <p>Excellente nouvelle ! Votre compte Opti-Troc a été <strong>validé avec succès</strong>.</p>

              ${profile?.is_early_adopter ? `
                <div class="promo-box">
                  <strong style="color: #f59e0b;">🎉 Rappel Early Adopter</strong>
                  <p style="margin: 10px 0;">Vous bénéficiez de l'offre de lancement : <strong>3 € pour 3 mois</strong> !</p>
                </div>
              ` : ''}

              <h2>Vous pouvez maintenant :</h2>
              <ul>
                <li>✓ Créer vos premières annonces</li>
                <li>✓ Parcourir les offres disponibles</li>
                <li>✓ Contacter d'autres professionnels</li>
                <li>✓ Créer des alertes "Want to Buy"</li>
              </ul>

              <div style="text-align: center;">
                <a href="${appUrl}/dashboard" class="button">
                  Accéder à mon tableau de bord
                </a>
              </div>

              <p>Bienvenue sur Opti-Troc !<br><strong>L'équipe Opti-Troc</strong></p>

              <div class="footer">
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    } else {
      console.error('[validateUser] Aucun email trouvé pour le compte validé', {
        userId,
      })
    }
  } catch (emailError) {
    console.error('[validateUser] Envoi email de validation échoué', {
      userId,
      message: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Rejette un utilisateur en attente (admin seulement)
 */
export async function rejectUser(userId: string, reason: string = '') {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Email de rejet — non bloquant : le rejet est déjà enregistré, un échec
  // d'envoi ne doit pas laisser croire à l'admin que l'action a échoué.
  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name, company_name')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const recipientEmail = authUser?.user?.email
    const supportEmail = process.env.EMAIL_FROM ?? 'contact@opti-troc.com'

    if (recipientEmail) {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: "Votre compte Opti-Troc n'a pas pu être validé",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; }
              .notice { background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .reason { background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a2332; }
              .cta-box { text-align: center; margin: 28px 0; }
              .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #1a2332;">Votre dossier n'a pas pu être validé</h1>
              </div>

              <p>Bonjour ${profile?.first_name || profile?.contact_name || ''},</p>
              <p>
                Notre équipe a examiné la demande d'inscription
                ${profile?.company_name ? `de <strong>${profile.company_name}</strong>` : ''}
                sur Opti-Troc.
              </p>

              <div class="notice">
                <strong>Nous n'avons pas pu valider votre compte.</strong><br>
                La plateforme est réservée aux professionnels de l'optique, et les
                éléments fournis ne nous ont pas permis de confirmer cette qualité.
              </div>

              ${reason.trim() ? `
                <div class="reason">
                  <strong>Motif :</strong><br>
                  ${escapeHtml(reason.trim())}
                </div>
              ` : ''}

              <h2>Vous pouvez soumettre un nouveau dossier</h2>
              <p>
                Cette décision n'est pas définitive. Si vous disposez de documents
                complémentaires — extrait d'immatriculation à jour, numéro de TVA,
                justificatif d'activité — écrivez-nous et nous réexaminerons votre
                demande.
              </p>

              <div class="cta-box">
                <a href="mailto:${supportEmail}?subject=Nouveau%20dossier%20-%20Opti-Troc" class="cta">
                  Nous contacter
                </a>
              </div>

              <p>
                Vous pouvez aussi nous joindre directement à
                <a href="mailto:${supportEmail}">${supportEmail}</a> pour connaître
                le motif précis de cette décision.
              </p>

              <p>Cordialement,<br><strong>L'équipe Opti-Troc</strong></p>

              <div class="footer">
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    } else {
      console.error('[rejectUser] Aucun email trouvé pour le compte rejeté', {
        userId,
      })
    }
  } catch (emailError) {
    console.error('[rejectUser] Envoi email de rejet échoué', {
      userId,
      message: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Suspend un utilisateur validé (admin seulement)
 */
export async function suspendUser(userId: string, reason: string = '') {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      status: 'suspended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Email de suspension — non bloquant : la suspension est déjà enregistrée.
  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name, company_name')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const recipientEmail = authUser?.user?.email
    const supportEmail = process.env.EMAIL_FROM ?? 'contact@opti-troc.com'

    if (recipientEmail) {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: 'Votre compte Opti-Troc a été suspendu',
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
              .reason { background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a2332; }
              .cta-box { text-align: center; margin: 28px 0; }
              .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #1a2332;">Votre compte a été suspendu</h1>
              </div>

              <p>Bonjour ${profile?.first_name || profile?.contact_name || ''},</p>
              <p>
                L'accès au compte
                ${profile?.company_name ? `<strong>${profile.company_name}</strong>` : 'de votre établissement'}
                sur Opti-Troc a été suspendu par notre équipe.
              </p>

              <div class="notice">
                <strong>Cette suspension est temporaire.</strong><br>
                Votre compte et vos annonces ne sont pas supprimés. L'accès peut être
                rétabli une fois la situation clarifiée avec notre équipe.
              </div>

              ${reason.trim() ? `
                <div class="reason">
                  <strong>Motif :</strong><br>
                  ${escapeHtml(reason.trim())}
                </div>
              ` : ''}

              <p>
                Pour ${reason.trim() ? 'échanger sur cette décision' : 'connaître le motif de cette suspension'} ou demander le
                rétablissement de votre accès, contactez-nous à
                <a href="mailto:${supportEmail}">${supportEmail}</a>.
              </p>

              <div class="cta-box">
                <a href="mailto:${supportEmail}?subject=Suspension%20de%20compte%20-%20Opti-Troc" class="cta">
                  Nous contacter
                </a>
              </div>

              <p>Cordialement,<br><strong>L'équipe Opti-Troc</strong></p>

              <div class="footer">
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    } else {
      console.error('[suspendUser] Aucun email trouvé pour le compte suspendu', {
        userId,
      })
    }
  } catch (emailError) {
    console.error('[suspendUser] Envoi email de suspension échoué', {
      userId,
      message: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Réactive un utilisateur suspendu (admin seulement)
 */
export async function reactivateUser(userId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      status: 'validated',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Email de réactivation — non bloquant : la réactivation est déjà enregistrée.
  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name, company_name')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const recipientEmail = authUser?.user?.email

    if (recipientEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: '✅ Votre compte Opti-Troc a été réactivé',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; background: #22c55e; color: white; border-radius: 8px; margin-bottom: 20px; }
              .notice { background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
              .cta-box { text-align: center; margin: 28px 0; }
              .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ Compte réactivé</h1>
              </div>

              <p>Bonjour ${profile?.first_name || profile?.contact_name || ''},</p>
              <p>
                Bonne nouvelle : l'accès au compte
                ${profile?.company_name ? `<strong>${profile.company_name}</strong>` : 'de votre établissement'}
                sur Opti-Troc a été rétabli.
              </p>

              <div class="notice">
                <strong>Votre accès est de nouveau actif.</strong><br>
                Vos annonces et vos conversations sont intactes : vous retrouvez votre
                compte tel que vous l'aviez laissé.
              </div>

              <div class="cta-box">
                <a href="${appUrl}/dashboard" class="cta">
                  Accéder à mon tableau de bord
                </a>
              </div>

              <p>À très bientôt sur Opti-Troc !<br><strong>L'équipe Opti-Troc</strong></p>

              <div class="footer">
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    } else {
      console.error('[reactivateUser] Aucun email trouvé pour le compte réactivé', {
        userId,
      })
    }
  } catch (emailError) {
    console.error('[reactivateUser] Envoi email de réactivation échoué', {
      userId,
      message: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Archive un utilisateur (admin seulement)
 * Les utilisateurs archivés sont conservés pendant 5 ans pour conformité légale (RGPD)
 * Utilisé lorsque l'utilisateur demande la suppression de son compte
 */
export async function archiveUser(userId: string, reason?: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Calculer la date d'expiration (5 ans)
  const expirationDate = new Date()
  expirationDate.setFullYear(expirationDate.getFullYear() + 5)

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      archived_by: auth.userId,
      archive_expiry: expirationDate.toISOString(),
      archive_reason: reason || 'Demande de suppression de compte utilisateur',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Supprime définitivement un utilisateur (admin seulement)
 * Pour nettoyer les comptes test ou les entrées orphelines
 */
export async function forceDeleteUser(userId: string) {
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Supprimer le profil d'abord (s'il existe)
  await supabaseAdmin
    .from('user_profiles')
    .delete()
    .eq('id', userId)

  // Supprimer l'utilisateur de auth.users
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')

  return { success: true }
}

/**
 * Supprime définitivement un utilisateur archivé (admin seulement)
 * À utiliser uniquement après expiration de la période d'archivage (5 ans)
 */
export async function deleteArchivedUser(userId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Vérifier que l'utilisateur est bien archivé
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('status, archive_expiry')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { success: false, error: 'Utilisateur non trouvé' }
  }

  if (profile.status !== 'archived') {
    return { success: false, error: 'Seuls les utilisateurs archivés peuvent être supprimés définitivement' }
  }

  // Vérifier que la période d'archivage est expirée
  if (profile.archive_expiry && new Date(profile.archive_expiry) > new Date()) {
    return {
      success: false,
      error: `La période d'archivage n'est pas encore expirée (expire le ${new Date(profile.archive_expiry).toLocaleDateString('fr-FR')})`
    }
  }

  // Supprimer l'utilisateur de auth.users (cascade vers user_profiles)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')

  return { success: true }
}

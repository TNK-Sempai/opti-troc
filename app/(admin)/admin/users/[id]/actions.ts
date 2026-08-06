'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth-helpers'
import { Resend } from 'resend'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function validateUser(formData: FormData) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const userId = formData.get('userId') as string

  try {
    // 1. Mettre à jour le statut
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        status: 'validated',
        validated_by: auth.userId,
        validation_date: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // 2. Récupérer les infos pour l'email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name, is_early_adopter')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)

    // 3. Envoyer email de validation
    if (authUser.user?.email) {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: authUser.user.email,
        subject: '✅ Votre compte Opti-troc est validé !',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; background: #22c55e; color: white; border-radius: 8px; margin-bottom: 20px; }
              .button { display: inline-block; background: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
              .promo-box { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ Compte validé !</h1>
              </div>
              
              <p>Bonjour ${profile?.first_name || profile?.contact_name},</p>
              <p>Excellente nouvelle ! Votre compte Opti-troc a été <strong>validé avec succès</strong>.</p>
              
              ${profile?.is_early_adopter ? `
                <div class="promo-box">
                  <strong style="color: #f59e0b;">🎉 Rappel Early Adopter</strong>
                  <p style="margin: 10px 0;">Vous bénéficiez de l'offre de lancement : <strong>3€ pour 3 mois</strong> !</p>
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">
                  Se connecter
                </a>
              </div>
              
              <p>Bienvenue sur Opti-troc !<br><strong>L'équipe Opti-troc</strong></p>
            </div>
          </body>
          </html>
        `,
      })
    }

    revalidatePath('/admin')
    redirect('/admin')
  } catch (error) {
    logError('validateUser', error)
    throw error
  }
}


export async function updateAccountType(formData: FormData) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const userId = formData.get('userId') as string
  const accountType = formData.get('accountType') as 'shop' | 'supplier'

  // Validation des paramètres
  if (!userId || !accountType) {
    return { success: false, error: 'Missing required parameters' }
  }

  if (!['shop', 'supplier'].includes(accountType)) {
    return { success: false, error: 'Invalid account type' }
  }

  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        account_type: accountType,
      })
      .eq('id', userId)

    if (error) throw error

    revalidatePath(`/admin/users/${userId}`)
    return { success: true }
  } catch (error) {
    logError('updateAccountType', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

export async function rejectUser(formData: FormData) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const userId = formData.get('userId') as string

  try {
    // 1. Mettre à jour le statut
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        status: 'rejected',
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // 2. Récupérer les infos pour l'email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)

    // 3. Envoyer email de rejet
    if (authUser.user?.email) {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: authUser.user.email,
        subject: 'Votre demande Opti-troc',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Demande d'inscription</h1>
              
              <p>Bonjour ${profile?.first_name || profile?.contact_name},</p>
              <p>Nous avons bien reçu votre demande d'inscription sur Opti-troc.</p>
              
              <p>Malheureusement, après vérification, nous ne pouvons pas valider votre compte pour le moment.</p>
              
              <p>Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter à support@opti-troc.com</p>
              
              <p>Cordialement,<br><strong>L'équipe Opti-troc</strong></p>
            </div>
          </body>
          </html>
        `,
      })
    }

    revalidatePath('/admin')
    redirect('/admin')
  } catch (error) {
    logError('rejectUser', error)
    throw error
  }
}

export async function requestMoreInfo(formData: FormData) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const userId = formData.get('userId') as string

  try {
    // Récupérer les infos pour l'email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, contact_name, company_name')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)

    // Envoyer email demandant plus d'infos
    if (authUser.user?.email) {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: authUser.user.email,
        subject: 'Opti-troc - Informations complémentaires requises',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; }
              .info-box { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #1a2332;">Informations complémentaires</h1>
              </div>
              
              <p>Bonjour ${profile?.first_name || profile?.contact_name},</p>
              <p>Nous examinons actuellement votre demande d'inscription sur Opti-troc pour <strong>${profile?.company_name}</strong>.</p>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>Nous aurions besoin de précisions concernant :</strong></p>
                <ul style="margin: 10px 0;">
                  <li>Vos documents officiels (qualité, lisibilité)</li>
                  <li>Vos informations d'entreprise</li>
                  <li>Votre activité professionnelle</li>
                </ul>
              </div>
              
              <p>Merci de nous répondre directement à cet email avec les informations ou documents complémentaires.</p>
              
              <p>Notre équipe vous répondra dans les plus brefs délais.</p>
              
              <p>Cordialement,<br><strong>L'équipe Opti-troc</strong></p>
            </div>
          </body>
          </html>
        `,
      })
    }

    revalidatePath('/admin')
    redirect('/admin')
  } catch (error) {
    logError('requestMoreInfo', error)
    throw error
  }
}
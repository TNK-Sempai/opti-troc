'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { logError, logInfo } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface RegistrationData {
  companyName: string
  country: 'BE' | 'NL' | 'LU' | 'FR' | 'CH'
  companyNumber: string
  vatNumber: string
  officialDocumentUrl: string
  email: string
  password: string
  phone: string
  contactName: string
  shopAddress: string
  city: string
  postalCode: string
  openingHours?: Array<{ day: string; hours: string }>
  logoUrl: string
  shopPhotosUrls?: string[]
}

export async function registerUser(data: RegistrationData) {
  try {
    let userId: string

    // 1. Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.find((u) => u.email === data.email)

    if (userExists) {
      // Utilisateur existe, vérifier si le profil existe
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', userExists.id)
        .single()

      if (existingProfile) {
        // Profil existe déjà, inscription complète
        return {
          success: false,
          error: 'Un compte avec cet email existe déjà',
        }
      }

      // Utilisateur existe mais pas le profil, on va le créer
      logInfo('registerUser', 'User exists but profile missing, creating profile...')
      userId = userExists.id
    } else {
      // Créer un nouvel utilisateur
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: false,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erreur lors de la création du compte')

      userId = authData.user.id
    }

    // 2. Vérifier compteur early adopters
    const { data: promoData } = await supabaseAdmin
      .from('promo_counter')
      .select('early_adopters_count, max_early_adopters')
      .single()

    const isEarlyAdopter = (promoData?.early_adopters_count || 0) < (promoData?.max_early_adopters || 2000)

    // 3. Incrémenter le compteur si éligible
    if (isEarlyAdopter) {
      await supabaseAdmin.rpc('increment_early_adopters')
    }

    // 4. Calculer la date de fin de promo (3 mois)
    const promoEndDate = isEarlyAdopter
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      : null

    // 5. Créer le profil utilisateur
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        account_type: 'shop',
        status: 'pending',
        company_name: data.companyName,
        country: data.country,
        company_number: data.companyNumber,
        vat_number: data.vatNumber,
        phone: data.phone,
        contact_name: data.contactName,
        shop_address: data.shopAddress,
        city: data.city,
        postal_code: data.postalCode,
        opening_hours: data.openingHours || [],
        profile_photo_url: data.logoUrl,
        shop_photos: data.shopPhotosUrls || [],
        is_early_adopter: isEarlyAdopter,
        promo_end_date: promoEndDate?.toISOString(),
      })

    if (profileError) {
      logError('registerUser', profileError)
      throw new Error(`Erreur création profil: ${profileError.message}`)
    }

    logInfo('registerUser', 'Profile created successfully for user:', userId)

    // 6. Créer l'entrée pour le document officiel
    const { error: docError } = await supabaseAdmin
      .from('user_documents')
      .insert({
        user_id: userId,
        document_type: 'official',
        document_url: data.officialDocumentUrl,
        status: 'pending',
      })

    if (docError) {
      logError('registerUser', docError)
      throw new Error(`Erreur création document: ${docError.message}`)
    }

    logInfo('registerUser', 'Document created successfully for user:', userId)

    // 7. Envoyer email de confirmation
    try {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: data.email,
        subject: 'Confirmez votre inscription - Opti-troc',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; }
              .promo-box { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #1a2332;">Bienvenue sur Opti-troc !</h1>
              </div>
              
              <p>Bonjour ${data.contactName},</p>
              <p>Merci de vous être inscrit sur Opti-troc, la marketplace B2B pour opticiens professionnels.</p>
              
              ${isEarlyAdopter ? `
                <div class="promo-box">
                  <strong style="color: #f59e0b; font-size: 18px;">🎉 Félicitations !</strong>
                  <p style="margin: 10px 0;">Vous faites partie des 2000 premiers inscrits et bénéficiez de l'offre de lancement : <strong>1€/mois pendant 3 mois</strong> !</p>
                </div>
              ` : ''}
              
              <h2>Prochaines étapes :</h2>
              <ol>
                <li><strong>Validation de votre compte</strong> : notre équipe vérifie vos documents (24-48h)</li>
                <li><strong>Accès à la plateforme</strong> : dès validation, vous pourrez vous connecter</li>
                <li><strong>Commencez à vendre</strong> : créez vos premières annonces !</li>
              </ol>
              
              <p>Nous vous tiendrons informé par email de l'avancement de votre validation.</p>
              
              <p>À très bientôt,<br><strong>L'équipe Opti-troc</strong></p>
              
              <div class="footer">
                <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
      logInfo('registerUser', 'Email sent to:', data.email)
    } catch (emailError) {
      logError('registerUser', emailError)
    }

    return {
      success: true,
      isEarlyAdopter,
      message: isEarlyAdopter
        ? 'Inscription réussie ! Vous bénéficiez de l\'offre de lancement.'
        : 'Inscription réussie !',
    }
  } catch (error) {
    logError('registerUser', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface OnboardingData {
  companyName: string
  country: 'BE' | 'NL' | 'LU' | 'FR' | 'CH'
  companyNumber: string
  vatNumber: string
  phone: string
  officialDocumentUrl: string
  shopAddress: string
  city: string
  postalCode: string
  openingHours?: Array<{ day: string; hours: string }>
  logoUrl?: string
  shopPhotosUrls?: string[]
}

export async function completeOnboarding(data: OnboardingData) {
  try {
    const supabase = await createClient()
    
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Non authentifié')
    }

    const userId = user.id

    // Vérifier le compteur early adopters.
    // maybeSingle() et non single() : ce dernier renvoie une erreur quand la
    // table est vide, alors qu'ici l'absence de ligne est un cas légitime.
    let { data: promoData } = await supabaseAdmin
      .from('promo_counter')
      .select('early_adopters_count, max_early_adopters')
      .maybeSingle()

    // Première utilisation : on amorce le compteur.
    if (!promoData) {
      const { data: created, error: createError } = await supabaseAdmin
        .from('promo_counter')
        .insert({ early_adopters_count: 0, max_early_adopters: 2000 })
        .select('early_adopters_count, max_early_adopters')
        .single()

      if (createError) {
        console.error('[completeOnboarding] Échec init promo_counter', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
        })
      } else {
        promoData = created
      }
    }

    const isEarlyAdopter = (promoData?.early_adopters_count || 0) < (promoData?.max_early_adopters || 2000)

    // Incrémenter le compteur si éligible
    if (isEarlyAdopter) {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_early_adopters')

      // Non bloquant, mais un compteur qui n'avance jamais fausse l'éligibilité
      // de tous les inscrits suivants : il faut le voir passer.
      if (rpcError) {
        console.error('[completeOnboarding] Échec rpc increment_early_adopters', {
          userId,
          code: rpcError.code,
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint,
        })
      }
    }

    // Calculer la date de fin de promo (3 mois)
    const promoEndDate = isEarlyAdopter
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      : null

    // Mettre à jour le profil avec toutes les infos
    const profileUpdate: Record<string, unknown> = {
      status: 'awaiting_payment', // Passe de 'incomplete' à 'awaiting_payment' (paiement requis avant validation admin)
      company_name: data.companyName,
      country: data.country,
      company_number: data.companyNumber,
      vat_number: data.vatNumber,
      phone: data.phone,
      shop_address: data.shopAddress,
      city: data.city,
      postal_code: data.postalCode,
      opening_hours: data.openingHours || [],
      is_early_adopter: isEarlyAdopter,
      promo_end_date: promoEndDate?.toISOString(),
    }

    // Les images sont optionnelles : sans nouvel upload on ne touche pas aux
    // colonnes, plutôt que d'écraser d'éventuelles valeurs existantes par vide.
    if (data.logoUrl) {
      profileUpdate.profile_photo_url = data.logoUrl
    }
    if (data.shopPhotosUrls && data.shopPhotosUrls.length > 0) {
      profileUpdate.shop_photos = data.shopPhotosUrls
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(profileUpdate)
      .eq('id', userId)

    if (updateError) {
      // console.error et non logError : ce dernier est silencieux en production
      // (lib/logger.ts), or c'est là que la cause doit être lisible.
      console.error('[completeOnboarding] Échec update user_profiles', {
        userId,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        columns: Object.keys(profileUpdate),
      })
      throw new Error('Erreur lors de la mise à jour du profil')
    }

    // Créer l'entrée pour le document officiel
    const { error: docError } = await supabaseAdmin
      .from('user_documents')
      .insert({
        user_id: userId,
        document_type: 'official',
        document_url: data.officialDocumentUrl,
        status: 'pending',
      })

    if (docError) {
      console.error('[completeOnboarding] Échec insert user_documents', {
        userId,
        code: docError.code,
        message: docError.message,
        details: docError.details,
        hint: docError.hint,
      })
      throw new Error('Erreur lors de l\'enregistrement du document')
    }

    // Récupérer les infos du profil pour l'email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('contact_name, first_name')
      .eq('id', userId)
      .single()

    // Envoyer email de confirmation
    try {
      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: user.email!,
        subject: 'Dernière étape : activez votre compte - Opti-troc',
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
              .cta-box { text-align: center; margin: 28px 0; }
              .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #1a2332;">Profil complété !</h1>
              </div>

              <p>Bonjour ${profile?.first_name || profile?.contact_name},</p>
              <p>Merci d'avoir complété votre profil sur Opti-troc. <strong>Il reste une dernière étape avant que nous puissions étudier votre dossier : choisir votre formule et finaliser votre paiement.</strong></p>

              ${isEarlyAdopter ? `
                <div class="promo-box">
                  <strong style="color: #f59e0b; font-size: 18px;">🎉 Félicitations !</strong>
                  <p style="margin: 10px 0;">Vous faites partie des 2000 places de l'offre de lancement : <strong>3€ pour 3 mois</strong> (1 par établissement) !</p>
                </div>
              ` : ''}

              <div class="cta-box">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/inscription/plans" class="cta">Choisir ma formule</a>
              </div>

              <h2>Prochaines étapes :</h2>
              <ol>
                <li><strong>Choix de la formule et paiement</strong> : c'est l'étape en cours, votre compte n'est pas encore actif</li>
                <li><strong>Validation de votre compte</strong> : dès le paiement reçu, notre équipe vérifie vos documents (24-48h)</li>
                <li><strong>Accès complet</strong> : créez vos annonces et commencez à vendre !</li>
              </ol>

              <p>Tant que le paiement n'est pas finalisé, votre dossier n'est pas transmis à notre équipe de validation. Vous pouvez reprendre où vous en étiez à tout moment en vous connectant.</p>

              <p>À très bientôt,<br><strong>L'équipe Opti-troc</strong></p>

              <div class="footer">
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      // Pas bloquant : le profil est déjà enregistré.
      console.error('[completeOnboarding] Envoi email échoué', {
        userId,
        message: emailError instanceof Error ? emailError.message : String(emailError),
      })
    }

    return {
      success: true,
      isEarlyAdopter,
    }
  } catch (error) {
    // L'erreur peut venir de GoTrue (AuthError : code/status) ou de PostgREST
    // (PostgrestError : code/details/hint) — on extrait ce qui est présent.
    const err = error as {
      code?: string
      message?: string
      details?: string
      hint?: string
      status?: number
    }

    console.error('[completeOnboarding] Échec de l\'onboarding', {
      code: err?.code,
      message: err?.message ?? String(error),
      details: err?.details,
      hint: err?.hint,
      status: err?.status,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
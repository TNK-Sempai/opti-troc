'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/logger'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile'

export async function updateProfile(data: ProfileFormValues) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Revalidation côté serveur : le client peut toujours contourner le zod du navigateur.
    const parsed = profileSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Données invalides',
      }
    }

    const v = parsed.data

    // Whitelist stricte des colonnes modifiables : status, role, subscription_*,
    // stripe_customer_id et is_early_adopter ne sont pas éditables ici.
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        civility: v.civility,
        first_name: v.firstName,
        last_name: v.lastName,
        contact_name: `${v.firstName} ${v.lastName}`,
        phone: v.phone,
        company_name: v.companyName,
        shop_address: v.shopAddress,
        city: v.city,
        postal_code: v.postalCode,
        country: v.country,
        vat_number: v.vatNumber,
        opening_hours: v.openingHours ?? [],
        profile_photo_url: v.profilePhotoUrl || null,
        shop_photos: v.shopPhotos ?? [],
        updated_at: new Date().toISOString(),
      })
      // L'id vient de la session, jamais du payload client.
      .eq('id', user.id)

    if (error) {
      logError('updateProfile', error)
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    revalidatePath('/dashboard/profil')
    // Le layout dashboard affiche prénom/nom/société dans la nav.
    revalidatePath('/dashboard', 'layout')

    return { success: true }
  } catch (error) {
    logError('updateProfile', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

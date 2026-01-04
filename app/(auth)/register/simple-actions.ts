'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SimpleRegistrationForm } from '@/lib/validations/auth'

export async function registerSimple(data: SimpleRegistrationForm) {
  try {
    // 1. Créer le compte Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirmer pour simplifier
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Erreur lors de la création du compte')

    const userId = authData.user.id

    // 2. Mettre à jour le profil créé automatiquement par le trigger
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        civility: data.civility,
        first_name: data.firstName,
        last_name: data.lastName,
        contact_name: `${data.firstName} ${data.lastName}`,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      throw new Error('Erreur lors de la mise à jour du profil')
    }

    // 3. Créer une session pour connecter automatiquement l'utilisateur
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      console.error('Auto sign-in error:', signInError)
      // Pas grave, l'utilisateur peut se connecter manuellement
    }

    return {
      success: true,
      userId,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
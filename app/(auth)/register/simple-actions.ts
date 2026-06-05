'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SimpleRegistrationForm } from '@/lib/validations/auth'
import { logError } from '@/lib/logger'

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

    // 2. Créer ou mettre à jour le profil utilisateur
    // Utilise upsert pour être robuste même si le trigger DB ne crée pas le profil
    const { error: upsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        email: data.email,
        civility: data.civility,
        first_name: data.firstName,
        last_name: data.lastName,
        contact_name: `${data.firstName} ${data.lastName}`,
        status: 'incomplete',
        role: 'user',
      }, { onConflict: 'id' })

    if (upsertError) {
      logError('registerSimple', upsertError)
      throw new Error('Erreur lors de la création du profil')
    }

    // 3. Auto-sign-in seulement s'il n'y a pas de session active (ex: admin qui teste)
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        logError('registerSimple', signInError)
      }
    }

    return {
      success: true,
      userId,
      // Si un admin est déjà connecté, ne pas auto-sign-in
      autoSignedIn: !currentUser,
    }
  } catch (error) {
    logError('registerSimple', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
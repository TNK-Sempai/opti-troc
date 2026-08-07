'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { rateLimit, getClientIp, tooManyRequestsMessage } from '@/lib/rate-limit'
import type { SimpleRegistrationForm } from '@/lib/validations/auth'

export async function registerSimple(data: SimpleRegistrationForm) {
  try {
    // 5 inscriptions / 10 min par IP. Pas de route /api/auth : l'inscription
    // est une Server Action, les headers viennent donc de next/headers.
    const ip = getClientIp(await headers())
    const limit = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000)

    if (!limit.success) {
      return {
        success: false,
        error: tooManyRequestsMessage(limit.retryAfterSeconds),
      }
    }

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
    // Utilise upsert pour être robuste même si le trigger DB ne crée pas le profil.
    // account_type est NOT NULL sans valeur par défaut : sans lui, l'INSERT échoue
    // en 23502 dès que le trigger n'a pas déjà créé la ligne.
    const { error: upsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        account_type: 'shop',
        civility: data.civility,
        first_name: data.firstName,
        last_name: data.lastName,
        contact_name: `${data.firstName} ${data.lastName}`,
        status: 'incomplete',
        role: 'user',
      }, { onConflict: 'id' })

    if (upsertError) {
      // console.error et non logError : ce dernier est silencieux en production
      // (lib/logger.ts), or c'est précisément en prod qu'il faut voir la cause.
      console.error('[registerSimple] Échec upsert user_profiles', {
        userId,
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      })

      // Rollback : un compte Auth sans profil est inutilisable ET bloque toute
      // nouvelle tentative avec le même email (createUser renverrait
      // « already registered »), sans aucun moyen de reprise côté utilisateur.
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (rollbackError) {
        console.error(
          '[registerSimple] Rollback impossible — compte Auth orphelin à supprimer manuellement',
          { userId, message: rollbackError.message }
        )
      }

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
        // Non bloquant : le compte et le profil existent, seule la session
        // automatique a échoué. L'utilisateur peut se connecter manuellement.
        console.error('[registerSimple] Auto-sign-in échoué', {
          userId,
          code: signInError.code,
          message: signInError.message,
          status: signInError.status,
        })
      }
    }

    return {
      success: true,
      userId,
      // Si un admin est déjà connecté, ne pas auto-sign-in
      autoSignedIn: !currentUser,
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

    console.error('[registerSimple] Échec de l\'inscription', {
      email: data.email,
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
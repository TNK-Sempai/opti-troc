'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

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

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Rejette un utilisateur en attente (admin seulement)
 */
export async function rejectUser(userId: string) {
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

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Suspend un utilisateur validé (admin seulement)
 */
export async function suspendUser(userId: string) {
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

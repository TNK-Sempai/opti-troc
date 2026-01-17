'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

/**
 * Met à jour le statut d'un message de contact (admin seulement)
 */
export async function updateMessageStatus(messageId: string, status: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Validation du statut
  const validStatuses = ['new', 'read', 'replied', 'archived']
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status value' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('contact_messages')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
      updated_by: auth.userId
    })
    .eq('id', messageId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/messages')
  
  return { success: true }
}

/**
 * Archive un message de contact (admin seulement)
 * Les messages archivés sont conservés pendant 5 ans pour conformité légale
 */
export async function archiveMessage(messageId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()

  // Calculer la date d'expiration (5 ans)
  const expirationDate = new Date()
  expirationDate.setFullYear(expirationDate.getFullYear() + 5)

  const { error } = await supabase
    .from('contact_messages')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      archived_by: auth.userId,
      archive_expiry: expirationDate.toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: auth.userId
    })
    .eq('id', messageId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/messages')

  return { success: true }
}

/**
 * Supprime définitivement un message de contact (admin seulement)
 * À utiliser uniquement pour les spams ou après expiration de 5 ans
 */
export async function deleteMessage(messageId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', messageId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/messages')

  return { success: true }
}
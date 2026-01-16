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
  const validStatuses = ['unread', 'read', 'resolved', 'spam']
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
 * Supprime un message de contact (admin seulement)
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
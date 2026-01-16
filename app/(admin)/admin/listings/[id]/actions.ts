'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

/**
 * Suspend un listing (admin seulement)
 */
export async function suspendListing(listingId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('listings')
    .update({ 
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspended_by: auth.userId
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${listingId}`)
  
  return { success: true }
}

/**
 * Réactive un listing suspendu (admin seulement)
 */
export async function reactivateListing(listingId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('listings')
    .update({ 
      status: 'active',
      suspended_at: null,
      suspended_by: null
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${listingId}`)
  
  return { success: true }
}

/**
 * Bannit définitivement un listing (admin seulement)
 */
export async function banListing(listingId: string, reason?: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('listings')
    .update({
      status: 'banned',
      banned_at: new Date().toISOString(),
      banned_by: auth.userId,
      ban_reason: reason
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${listingId}`)
  
  return { success: true }
}

/**
 * Supprime un listing (admin seulement)
 */
export async function deleteListing(listingId: string) {
  // Vérification d'autorisation admin
  const auth = await requireAdmin()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { error } = await supabaseAdmin
    .from('listings')
    .delete()
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/listings')
  
  return { success: true }
}
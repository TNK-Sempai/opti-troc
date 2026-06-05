import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type AuthResult = 
  | { success: true; userId: string }
  | { success: false; error: string }

export type AdminAuthResult = 
  | { success: true; userId: string; isAdmin: true }
  | { success: false; error: string }

/**
 * Vérifie que l'utilisateur est authentifié
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false, error: 'Unauthorized - Authentication required' }
  }

  return { success: true, userId: user.id }
}

/**
 * Vérifie que l'utilisateur est authentifié ET a le rôle admin
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const authResult = await requireAuth()
  
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', authResult.userId)
    .single()

  if (error || !profile) {
    return { success: false, error: 'Failed to verify user role' }
  }

  if (profile.role !== 'admin') {
    return { success: false, error: 'Forbidden - Admin access required' }
  }

  return { success: true, userId: authResult.userId, isAdmin: true }
}

/**
 * Vérifie si l'utilisateur courant est validé (ou admin).
 * Safe pour les pages publiques — pas de redirect, retourne null si non connecté.
 */
export async function getValidatedUser(): Promise<{ userId: string; isValidated: boolean } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('status, role')
    .eq('id', user.id)
    .single()

  const isValidated = profile?.status === 'validated' || profile?.role === 'admin'
  return { userId: user.id, isValidated }
}
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(email: string, password: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect'
          : error.message,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erreur de connexion',
      }
    }

    return {
      success: true,
      userId: data.user.id,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue',
    }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
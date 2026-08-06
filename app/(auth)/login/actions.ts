'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { logError } from '@/lib/logger';

export async function login(email: string, password: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error:
          error.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect'
            : error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erreur de connexion',
      };
    }

    // Récupérer le profil pour savoir où rediriger
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single();

    // Invalide le cache RSC + le Router Cache client pour que le Header
    // (rendu dans le layout marketplace) reflète la nouvelle session.
    revalidatePath('/', 'layout');

    return {
      success: true,
      userId: data.user.id,
      role: profile?.role,
      status: profile?.status,
    };
  } catch (error) {
    logError('login', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function submitContactMessage(formData: FormData) {

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    company: formData.get('company') as string || null,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  }

  // Validation basique
  if (!data.name || !data.email || !data.subject || !data.message) {
    return { success: false, error: 'Tous les champs requis doivent être remplis' }
  }

  const { error } = await supabaseAdmin
    .from('contact_messages')
    .insert([data])

  if (error) {
    console.error('Contact message error:', error)
    return { success: false, error: 'Erreur lors de l\'envoi du message' }
  }

  return { success: true }
}
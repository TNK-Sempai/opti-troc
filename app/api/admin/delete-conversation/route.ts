import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Vérifier que c'est un admin
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('id')

  if (!conversationId) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }

  // Supprimer messages puis participants puis conversation
  // (au cas où CASCADE n'est pas configuré)
  await supabaseAdmin
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId)

  await supabaseAdmin
    .from('conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)

  const { error } = await supabaseAdmin
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier que l'utilisateur est participant
  const { data: participation } = await supabaseAdmin
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', id)
    .eq('user_id', user.id)
    .single()

  if (!participation) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Charger les messages
  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select(`
      *,
      sender:user_profiles!messages_sender_id_fkey(
        id,
        first_name,
        last_name,
        company_name,
        role
      )
    `)
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  // Marquer comme lu
  await supabaseAdmin
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ messages: messages || [] })
}

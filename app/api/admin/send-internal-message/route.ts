import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { upsertParticipants, sendMessage } from '@/lib/messaging/conversation-helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier que l'utilisateur est admin (supabaseAdmin pour bypass RLS)
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { email, subject, content } = await request.json()

    if (!email || !content?.trim()) {
      return NextResponse.json({ error: 'Email and content required' }, { status: 400 })
    }

    // Trouver l'utilisateur par email via auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      throw new Error('Erreur lors de la recherche de l\'utilisateur')
    }

    const recipientAuthUser = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!recipientAuthUser) {
      return NextResponse.json({
        error: 'Utilisateur non trouvé avec cet email. Utilisez le bouton "Email" pour envoyer un email classique.'
      }, { status: 404 })
    }

    const recipientId = recipientAuthUser.id

    // Chercher une conversation admin existante entre l'admin et cet utilisateur
    const { data: adminParticipations } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    let existingConvId = null

    if (adminParticipations && adminParticipations.length > 0) {
      const convIds = adminParticipations.map(p => p.conversation_id)

      const { data: recipientParticipations } = await supabaseAdmin
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', convIds)

      if (recipientParticipations && recipientParticipations.length > 0) {
        const sharedConvIds = recipientParticipations.map(p => p.conversation_id)

        const { data: adminConvs } = await supabaseAdmin
          .from('conversations')
          .select('id')
          .in('id', sharedConvIds)
          .is('listing_id', null)
          .limit(1)

        if (adminConvs && adminConvs.length > 0) {
          existingConvId = adminConvs[0].id
        }
      }
    }

    // Si une conversation existe, ajouter le message
    if (existingConvId) {
      const { error: msgError } = await sendMessage(supabaseAdmin, existingConvId, user.id, content)
      if (msgError) throw msgError

      return NextResponse.json({
        conversationId: existingConvId,
        message: 'Message envoyé'
      })
    }

    // Sinon, créer une nouvelle conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .insert({
        subject: subject || 'Support / Assistance',
        listing_id: null,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) throw convError

    // Ajouter les participants (upsert pour éviter les doublons)
    const { error: partError } = await upsertParticipants(
      supabaseAdmin,
      conversation.id,
      [user.id, recipientId]
    )

    if (partError) throw partError

    // Ajouter le premier message
    const { error: msgError } = await sendMessage(supabaseAdmin, conversation.id, user.id, content)
    if (msgError) throw msgError

    return NextResponse.json({
      conversationId: conversation.id,
      message: 'Conversation créée et message envoyé'
    })
  } catch (error: any) {
    console.error('Error sending internal message:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

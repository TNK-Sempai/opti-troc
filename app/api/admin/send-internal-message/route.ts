import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier que l'utilisateur est admin
  const { data: profile } = await supabase
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

    // Vérifier si une conversation existe déjà entre l'admin et cet utilisateur
    const { data: existingConvs } = await supabaseAdmin
      .from('conversations')
      .select('id, conversation_participants!inner(user_id)')
      .is('listing_id', null) // Conversations admin n'ont pas de listing_id

    let existingConvId = null
    if (existingConvs && existingConvs.length > 0) {
      for (const conv of existingConvs) {
        const participants = conv.conversation_participants as any[]
        const participantIds = participants.map((p: any) => p.user_id)

        if (
          participantIds.includes(user.id) &&
          participantIds.includes(recipientId) &&
          participantIds.length === 2
        ) {
          existingConvId = conv.id
          break
        }
      }
    }

    // Si une conversation existe, ajouter le message
    if (existingConvId) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: existingConvId,
        sender_id: user.id,
        content: content.trim(),
      })

      return NextResponse.json({
        conversationId: existingConvId,
        message: 'Message envoyé'
      })
    }

    // Sinon, créer une nouvelle conversation (utiliser supabaseAdmin pour contourner RLS)
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .insert({
        subject: subject || 'Support / Assistance',
        listing_id: null, // Pas de listing pour les conversations admin
      })
      .select()
      .single()

    if (convError) throw convError

    // Ajouter les participants (utiliser supabaseAdmin)
    const { error: partError } = await supabaseAdmin
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: recipientId },
      ])

    if (partError) throw partError

    // Ajouter le premier message (utiliser supabaseAdmin)
    const { error: msgError } = await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: content.trim(),
    })

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

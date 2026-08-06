import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse, after } from 'next/server'
import { logError } from '@/lib/logger'
import { notifyNewMessage } from '@/lib/messaging/notify'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const admin = supabaseAdmin
    const { wantedItemId, message } = await request.json()

    if (!wantedItemId || !message?.trim()) {
      return NextResponse.json({ error: 'Wanted item ID et message requis' }, { status: 400 })
    }

    const { data: wantedItem, error: wantedItemError } = await admin
      .from('wanted_items')
      .select('id, user_id, brand, model, reference')
      .eq('id', wantedItemId)
      .single()

    if (wantedItemError || !wantedItem) {
      return NextResponse.json({ error: 'Wanted item non trouvé' }, { status: 404 })
    }

    if (wantedItem.user_id === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas contacter votre propre recherche' },
        { status: 400 }
      )
    }

    const recipientId = wantedItem.user_id
    const itemTitle = [wantedItem.brand, wantedItem.model, wantedItem.reference]
      .filter(Boolean)
      .join(' ')
    const subject = `Recherche: ${itemTitle}`

    // Chercher une conversation existante
    const { data: myParticipations } = await admin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    let existingConvId = null

    if (myParticipations && myParticipations.length > 0) {
      const myConvIds = myParticipations.map(p => p.conversation_id)

      const { data: recipientParticipations } = await admin
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', myConvIds)

      if (recipientParticipations && recipientParticipations.length > 0) {
        const sharedConvIds = recipientParticipations.map(p => p.conversation_id)

        const { data: matchingConvs } = await admin
          .from('conversations')
          .select('id')
          .in('id', sharedConvIds)
          .is('listing_id', null)
          .eq('subject', subject)
          .limit(1)

        if (matchingConvs && matchingConvs.length > 0) {
          existingConvId = matchingConvs[0].id
        }
      }
    }

    if (existingConvId) {
      const { error: msgError } = await admin.from('messages').insert({
        conversation_id: existingConvId,
        sender_id: user.id,
        content: message.trim(),
      })
      if (msgError) throw msgError

      await admin
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', existingConvId)

      after(() =>
        notifyNewMessage({
          conversationId: existingConvId,
          senderId: user.id,
          content: message.trim(),
        })
      )

      return NextResponse.json({ conversationId: existingConvId, success: true })
    }

    // Créer une nouvelle conversation
    const { data: conversation, error: convError } = await admin
      .from('conversations')
      .insert({
        subject,
        listing_id: null,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) throw convError

    const { error: partError } = await admin
      .from('conversation_participants')
      .upsert(
        [
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: recipientId },
        ],
        { onConflict: 'conversation_id,user_id', ignoreDuplicates: true }
      )

    if (partError) throw partError

    const { error: msgError } = await admin.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: message.trim(),
    })
    if (msgError) throw msgError

    after(() =>
      notifyNewMessage({
        conversationId: conversation.id,
        senderId: user.id,
        content: message.trim(),
      })
    )

    return NextResponse.json({ conversationId: conversation.id, success: true })
  } catch (error: any) {
    logError('POST /api/conversations/start-wanted', error)
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

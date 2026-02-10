import { createClient } from '@/lib/supabase/server'
import { upsertParticipants, sendMessage } from '@/lib/messaging/conversation-helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { wantedItemId, message } = await request.json()

    if (!wantedItemId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Wanted item ID et message requis' },
        { status: 400 }
      )
    }

    const { data: wantedItem, error: wantedItemError } = await supabase
      .from('wanted_items')
      .select('id, user_id, brand, model, reference')
      .eq('id', wantedItemId)
      .single()

    if (wantedItemError || !wantedItem) {
      return NextResponse.json(
        { error: 'Wanted item non trouvé' },
        { status: 404 }
      )
    }

    if (wantedItem.user_id === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas contacter votre propre recherche' },
        { status: 400 }
      )
    }

    const recipientId = wantedItem.user_id

    // Construire le sujet pour identifier la conversation
    const itemTitle = [wantedItem.brand, wantedItem.model, wantedItem.reference]
      .filter(Boolean)
      .join(' ')
    const subject = `Recherche: ${itemTitle}`

    // Chercher une conversation existante entre ces 2 utilisateurs
    // avec le même sujet (pas de wanted_item_id sur la table conversations)
    const { data: myParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    let existingConvId = null

    if (myParticipations && myParticipations.length > 0) {
      const myConvIds = myParticipations.map(p => p.conversation_id)

      // Trouver les conversations partagées avec le destinataire
      const { data: recipientParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', myConvIds)

      if (recipientParticipations && recipientParticipations.length > 0) {
        const sharedConvIds = recipientParticipations.map(p => p.conversation_id)

        // Parmi celles-ci, trouver celle avec le même sujet (sans listing_id)
        const { data: matchingConvs } = await supabase
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
      const { error: messageError } = await sendMessage(supabase, existingConvId, user.id, message)

      if (messageError) {
        console.error('Error creating message:', messageError)
        return NextResponse.json(
          { error: 'Erreur lors de l\'envoi du message' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        conversationId: existingConvId,
        success: true,
      })
    }

    // Créer une nouvelle conversation (listing_id = null pour les wanted items)
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        subject,
        listing_id: null,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la conversation' },
        { status: 500 }
      )
    }

    const { error: partError } = await upsertParticipants(
      supabase,
      conversation.id,
      [user.id, recipientId]
    )

    if (partError) {
      console.error('Error adding participants:', partError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout des participants' },
        { status: 500 }
      )
    }

    const { error: messageError } = await sendMessage(supabase, conversation.id, user.id, message)

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversationId: conversation.id,
      success: true,
    })
  } catch (error) {
    console.error('Error in start-wanted conversation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

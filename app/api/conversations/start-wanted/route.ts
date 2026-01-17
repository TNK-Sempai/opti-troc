import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
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

    // Récupérer le wanted item et vérifier qu'il existe
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

    // Vérifier que l'utilisateur ne contacte pas son propre wanted item
    if (wantedItem.user_id === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas contacter votre propre recherche' },
        { status: 400 }
      )
    }

    // Vérifier si une conversation existe déjà entre ces deux utilisateurs pour ce wanted item
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('wanted_item_id', wantedItemId)
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${wantedItem.user_id}),and(user1_id.eq.${wantedItem.user_id},user2_id.eq.${user.id})`)
      .maybeSingle()

    let conversationId: string

    if (existingConversation) {
      // Utiliser la conversation existante
      conversationId = existingConversation.id

      // Ajouter le message à la conversation existante
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message.trim(),
        })

      if (messageError) {
        console.error('Error creating message:', messageError)
        return NextResponse.json(
          { error: 'Erreur lors de l\'envoi du message' },
          { status: 500 }
        )
      }

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
    } else {
      // Créer une nouvelle conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: wantedItem.user_id,
          wanted_item_id: wantedItemId,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (conversationError || !newConversation) {
        console.error('Error creating conversation:', conversationError)
        return NextResponse.json(
          { error: 'Erreur lors de la création de la conversation' },
          { status: 500 }
        )
      }

      conversationId = newConversation.id

      // Créer le premier message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message.trim(),
        })

      if (messageError) {
        console.error('Error creating message:', messageError)
        return NextResponse.json(
          { error: 'Erreur lors de l\'envoi du message' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      conversationId,
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

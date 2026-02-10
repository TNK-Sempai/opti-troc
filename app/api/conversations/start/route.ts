import { createClient } from '@/lib/supabase/server'
import { upsertParticipants, sendMessage } from '@/lib/messaging/conversation-helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { listingId, message } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Récupérer le listing pour obtenir le user_id (vendeur)
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('user_id, listing_type, unit_listings(brand, model), lot_listings(description)')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Vérifier que l'utilisateur ne contacte pas lui-même
    if (listing.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot contact yourself' }, { status: 400 })
    }

    const recipientId = listing.user_id

    // Vérifier si une conversation existe déjà pour ce listing entre ces 2 utilisateurs
    const { data: existingConvs } = await supabase
      .from('conversations')
      .select('id, conversation_participants!inner(user_id)')
      .eq('listing_id', listingId)

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

    // Si une conversation existe, ajouter le message et rediriger
    if (existingConvId) {
      const { error: msgError } = await sendMessage(supabase, existingConvId, user.id, message)
      if (msgError) throw msgError

      return NextResponse.json({ conversationId: existingConvId })
    }

    // Sinon, créer une nouvelle conversation
    const listingInfo = listing.listing_type === 'unit' && listing.unit_listings?.[0]
      ? `${listing.unit_listings[0].brand} ${listing.unit_listings[0].model}`
      : listing.lot_listings?.[0]?.description?.substring(0, 50)

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        listing_id: listingId,
        subject: `Concernant: ${listingInfo}`,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) {
      throw convError
    }

    // Ajouter les participants (upsert pour éviter les doublons)
    const { error: partError } = await upsertParticipants(
      supabase,
      conversation.id,
      [user.id, recipientId]
    )

    if (partError) throw partError

    // Ajouter le premier message
    const { error: msgError } = await sendMessage(supabase, conversation.id, user.id, message)
    if (msgError) throw msgError

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error: any) {
    console.error('Error starting conversation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

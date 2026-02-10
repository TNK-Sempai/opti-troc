import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getAdmin()
    const { listingId, message } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Récupérer le listing pour obtenir le vendeur
    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('user_id, listing_type, unit_listings(brand, model), lot_listings(description)')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot contact yourself' }, { status: 400 })
    }

    const recipientId = listing.user_id

    // Vérifier si une conversation existe déjà pour ce listing entre ces 2 utilisateurs
    const { data: existingConvs } = await admin
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)

    let existingConvId = null
    if (existingConvs && existingConvs.length > 0) {
      for (const conv of existingConvs) {
        const { data: parts } = await admin
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)

        const participantIds = (parts || []).map(p => p.user_id)
        if (participantIds.includes(user.id) && participantIds.includes(recipientId)) {
          existingConvId = conv.id
          break
        }
      }
    }

    // Si une conversation existe, ajouter le message
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

      return NextResponse.json({ conversationId: existingConvId })
    }

    // Sinon, créer une nouvelle conversation
    const listingInfo = listing.listing_type === 'unit' && listing.unit_listings?.[0]
      ? `${listing.unit_listings[0].brand} ${listing.unit_listings[0].model}`
      : listing.lot_listings?.[0]?.description?.substring(0, 50)

    const { data: conversation, error: convError } = await admin
      .from('conversations')
      .insert({
        listing_id: listingId,
        subject: `Concernant: ${listingInfo}`,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) throw convError

    // Ajouter les participants
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

    // Ajouter le premier message
    const { error: msgError } = await admin.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: message.trim(),
    })
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

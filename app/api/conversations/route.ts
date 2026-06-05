import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logError } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = supabaseAdmin

    // Step 1: Get participations (no .or() — filter is_archived in JS)
    const { data: rawParticipations, error: partError } = await admin
      .from('conversation_participants')
      .select('conversation_id, last_read_at, is_archived')
      .eq('user_id', user.id)

    if (partError) {
      logError('GET /api/conversations', partError)
      return NextResponse.json({ error: partError.message }, { status: 500 })
    }

    // Filter out archived in JS (handles NULL, false, undefined)
    const participations = (rawParticipations || []).filter(p => p.is_archived !== true)

    if (participations.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    const convIds = participations.map(p => p.conversation_id)
    const lastReadMap = Object.fromEntries(
      participations.map(p => [p.conversation_id, p.last_read_at])
    )

    // Step 2: Get conversations (NO nested join — separate queries for listings)
    const { data: conversations, error: convError } = await admin
      .from('conversations')
      .select('id, subject, listing_id, last_message_at, created_at')
      .in('id', convIds)
      .order('last_message_at', { ascending: false })

    if (convError) {
      logError('GET /api/conversations', convError)
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    // Step 3: Fetch listings separately for conversations that have one
    const listingIds = (conversations || [])
      .map(c => c.listing_id)
      .filter(Boolean) as string[]

    let listingsMap: Record<string, any> = {}

    if (listingIds.length > 0) {
      const { data: listings } = await admin
        .from('listings')
        .select(`
          id, listing_type, status, price,
          unit_listings (brand, model, reference, photos, condition),
          lot_listings (description, photos, quantity, unit_price)
        `)
        .in('id', listingIds)

      if (listings) {
        listingsMap = Object.fromEntries(listings.map(l => [l.id, l]))
      }
    }

    // Step 4: Enrich each conversation
    const enriched = await Promise.all(
      (conversations || []).map(async (conv) => {
        try {
          // Other participants (manual join — FK inference unreliable)
          const { data: otherParts } = await admin
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)

          const otherUserId = otherParts?.[0]?.user_id
          let otherProfile = null

          if (otherUserId) {
            const { data: profile } = await admin
              .from('user_profiles')
              .select('id, first_name, last_name, company_name, profile_photo_url')
              .eq('id', otherUserId)
              .single()
            otherProfile = profile
          }

          // Last message
          const { data: lastMessages } = await admin
            .from('messages')
            .select('id, content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)

          const lastMessage = lastMessages?.[0] || null

          // Unread count
          const lastRead = lastReadMap[conv.id]
          let unreadCount = 0

          if (lastRead) {
            const { count } = await admin
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .gt('created_at', lastRead)
            unreadCount = count || 0
          } else {
            const { count } = await admin
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
            unreadCount = count || 0
          }

          return {
            ...conv,
            listings: conv.listing_id ? (listingsMap[conv.listing_id] || null) : null,
            otherParticipant: otherProfile,
            lastMessage,
            unreadCount,
          }
        } catch (enrichError) {
          logError('GET /api/conversations', enrichError)
          return {
            ...conv,
            listings: conv.listing_id ? (listingsMap[conv.listing_id] || null) : null,
            otherParticipant: null,
            lastMessage: null,
            unreadCount: 0,
          }
        }
      })
    )

    return NextResponse.json({ conversations: enriched })
  } catch (error) {
    logError('GET /api/conversations', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

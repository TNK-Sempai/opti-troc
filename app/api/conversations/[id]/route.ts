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

  // Charger la conversation
  const { data: conversation } = await supabaseAdmin
    .from('conversations')
    .select(`
      *,
      listings (
        id,
        listing_type,
        unit_listings (brand, model),
        lot_listings (description)
      )
    `)
    .eq('id', id)
    .single()

  // Charger les participants (manual join — FK inference unreliable)
  const { data: rawParticipants } = await supabaseAdmin
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', id)

  const participantIds = (rawParticipants || []).map(p => p.user_id)
  let participants: any[] = []

  if (participantIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, company_name, profile_photo_url, role')
      .in('id', participantIds)

    const profilesById = new Map(profiles?.map(pr => [pr.id, pr]) ?? [])
    participants = (rawParticipants || []).map(p => ({
      user_id: p.user_id,
      user_profiles: profilesById.get(p.user_id) || null,
    }))
  }

  return NextResponse.json({ conversation, participants })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action } = await request.json()

  if (action === 'archive') {
    const { error } = await supabaseAdmin
      .from('conversation_participants')
      .update({ is_archived: true })
      .eq('conversation_id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}

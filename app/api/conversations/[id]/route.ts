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

  // Charger les participants avec profils
  const { data: participants } = await supabaseAdmin
    .from('conversation_participants')
    .select(`
      user_id,
      user_profiles (
        first_name,
        last_name,
        company_name,
        role
      )
    `)
    .eq('conversation_id', id)

  return NextResponse.json({ conversation, participants })
}

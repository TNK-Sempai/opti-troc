import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logError } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const admin = supabaseAdmin

    // Get all participations (non-archived)
    const { data: participations } = await admin
      .from('conversation_participants')
      .select('conversation_id, last_read_at, is_archived')
      .eq('user_id', user.id)

    const active = (participations || []).filter(p => p.is_archived !== true)

    if (active.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Count unread messages across all conversations
    let totalUnread = 0

    for (const p of active) {
      if (p.last_read_at) {
        const { count } = await admin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', p.conversation_id)
          .neq('sender_id', user.id)
          .gt('created_at', p.last_read_at)
        totalUnread += count || 0
      } else {
        const { count } = await admin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', p.conversation_id)
          .neq('sender_id', user.id)
        totalUnread += count || 0
      }
    }

    return NextResponse.json({ count: totalUnread })
  } catch (error) {
    logError('GET /api/conversations/unread-count', error)
    return NextResponse.json({ count: 0 })
  }
}

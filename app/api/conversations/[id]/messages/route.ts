import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse, after } from 'next/server'
import { logError } from '@/lib/logger'
import { notifyNewMessage } from '@/lib/messaging/notify'
import { rateLimit, getClientIp, tooManyRequestsMessage } from '@/lib/rate-limit'

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

  // Verify user is a participant
  const { data: participation } = await supabaseAdmin
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', id)
    .eq('user_id', user.id)
    .single()

  if (!participation) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Load messages
  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  // Load sender profiles (manual join — no FK dependency)
  const senderIds = [...new Set((messages || []).map((m) => m.sender_id))]
  let profileMap: Record<string, any> = {}

  if (senderIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, company_name, profile_photo_url')
      .in('id', senderIds)

    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
    }
  }

  const enrichedMessages = (messages || []).map((m) => ({
    ...m,
    sender: profileMap[m.sender_id] || null,
  }))

  // Mark as read
  await supabaseAdmin
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ messages: enrichedMessages })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 30 messages / min : laisse une conversation normale respirer, coupe le flood.
  const ip = getClientIp(request.headers)
  const limit = rateLimit(`messages:${ip}`, 30, 60 * 1000)

  if (!limit.success) {
    return NextResponse.json(
      { error: tooManyRequestsMessage(limit.retryAfterSeconds) },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is a participant
  const { data: participation } = await supabaseAdmin
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', id)
    .eq('user_id', user.id)
    .single()

  if (!participation) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  // Insert message
  const { error: msgError } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: id,
      sender_id: user.id,
      content: content.trim(),
    })

  if (msgError) {
    logError('POST /api/conversations/[id]/messages', msgError)
    return NextResponse.json({ error: msgError.message }, { status: 500 })
  }

  // Update last_message_at
  await supabaseAdmin
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', id)

  // Notification email après la réponse : n'ajoute pas la latence Resend
  // au temps d'envoi d'un message.
  after(() =>
    notifyNewMessage({
      conversationId: id,
      senderId: user.id,
      content: content.trim(),
    })
  )

  return NextResponse.json({ success: true })
}

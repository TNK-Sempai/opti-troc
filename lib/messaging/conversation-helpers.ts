import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ajoute des participants à une conversation en utilisant upsert
 * pour éviter les erreurs "duplicate key" si les participants existent déjà.
 */
export async function upsertParticipants(
  client: SupabaseClient,
  conversationId: string,
  userIds: string[]
) {
  const participants = userIds.map((userId) => ({
    conversation_id: conversationId,
    user_id: userId,
  }))

  const { error } = await client
    .from('conversation_participants')
    .upsert(participants, {
      onConflict: 'conversation_id,user_id',
      ignoreDuplicates: true,
    })

  return { error }
}

/**
 * Envoie un message dans une conversation et met à jour last_message_at.
 */
export async function sendMessage(
  client: SupabaseClient,
  conversationId: string,
  senderId: string,
  content: string
) {
  const { error: msgError } = await client.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: content.trim(),
  })

  if (msgError) return { error: msgError }

  const { error: updateError } = await client
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return { error: updateError }
}

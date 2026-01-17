'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageInput } from './MessageInput'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2, User } from 'lucide-react'

interface ConversationViewProps {
  conversationId: string
  currentUserId: string
}

export function ConversationView({
  conversationId,
  currentUserId,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversation()
    loadMessages()
    markAsRead()

    // S'abonner aux nouveaux messages
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadConversation() {
    const { data } = await supabase
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
      .eq('id', conversationId)
      .single()

    setConversation(data)

    // Charger les participants
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        user_profiles (
          first_name,
          last_name,
          company_name
        )
      `)
      .eq('conversation_id', conversationId)

    setParticipants(parts || [])
  }

  async function loadMessages() {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        user_profiles:sender_id (
          first_name,
          last_name
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    setLoading(false)
  }

  async function markAsRead() {
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const otherParticipant = participants.find((p) => p.user_id !== currentUserId)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div>
          <CardTitle className="text-lg">
            {otherParticipant?.user_profiles
              ? `${otherParticipant.user_profiles.first_name} ${otherParticipant.user_profiles.last_name}`
              : 'Conversation'}
          </CardTitle>
          {otherParticipant?.user_profiles?.company_name && (
            <p className="text-sm text-muted-foreground">
              {otherParticipant.user_profiles.company_name}
            </p>
          )}
          {conversation?.subject && (
            <p className="text-sm text-muted-foreground mt-1">
              Sujet: {conversation.subject}
            </p>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Aucun message pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              const senderProfile = participants.find(
                (p) => p.user_id === message.sender_id
              )?.user_profiles

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>

                    <div>
                      <div
                        className={`rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {!isOwn && senderProfile && (
                          <p className="text-xs font-semibold mb-1">
                            {senderProfile.first_name} {senderProfile.last_name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {format(new Date(message.created_at), 'PPp', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      <CardContent className="flex-shrink-0 border-t p-4">
        <MessageInput
          conversationId={conversationId}
          currentUserId={currentUserId}
          onMessageSent={() => {
            loadMessages()
            markAsRead()
          }}
        />
      </CardContent>
    </Card>
  )
}

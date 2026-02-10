'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageInput } from './MessageInput'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2, User, Trash2 } from 'lucide-react'

interface ConversationViewProps {
  conversationId: string
  currentUserId: string
  isAdmin?: boolean
}

export function ConversationView({
  conversationId,
  currentUserId,
  isAdmin = false,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversation()
    loadMessages()

    // S'abonner aux nouveaux messages en temps réel
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
        () => {
          loadMessages()
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
    const res = await fetch(`/api/conversations/${conversationId}`)
    if (res.ok) {
      const data = await res.json()
      setConversation(data.conversation)
      setParticipants(data.participants || [])
    }
  }

  async function loadMessages() {
    setLoading(true)
    const res = await fetch(`/api/conversations/${conversationId}/messages`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages || [])
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette conversation et tous ses messages ? Cette action est irréversible.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/delete-conversation?id=${conversationId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      window.location.href = window.location.pathname
    } else {
      alert('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const otherParticipant = participants.find((p) => p.user_id !== currentUserId)

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-start justify-between">
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
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
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
              const senderProfile =
                message.sender ||
                participants.find((p) => p.user_id === message.sender_id)?.user_profiles

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isOwn ? 'bg-pine-teal/10' : 'bg-fern/10'
                    }`}>
                      <User className={`w-4 h-4 ${isOwn ? 'text-pine-teal' : 'text-fern'}`} />
                    </div>

                    <div>
                      <div
                        className={`rounded-lg p-3 ${
                          isOwn
                            ? 'bg-pine-teal text-white'
                            : 'bg-dust-grey text-charcoal'
                        }`}
                      >
                        {!isOwn && senderProfile && (
                          <p className="text-xs font-semibold mb-1 opacity-80">
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
          onMessageSent={loadMessages}
        />
      </CardContent>
    </Card>
  )
}

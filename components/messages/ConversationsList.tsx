'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageSquare } from 'lucide-react'

interface ConversationsListProps {
  conversations: any[]
  selectedId?: string
  currentUserId: string
}

export function ConversationsList({
  conversations,
  selectedId,
  currentUserId,
}: ConversationsListProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg">Conversations</CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune conversation</p>
            </div>
          ) : (
            <div>
              {conversations.map((conv) => {
                const otherParticipant = conv.participants?.[0]?.user_profiles
                const isSelected = conv.id === selectedId
                const hasUnread = conv.unreadCount > 0

                return (
                  <Link
                    key={conv.id}
                    href={`/dashboard/messages?conversation=${conv.id}`}
                    className={`block border-b border-border hover:bg-accent transition-colors ${
                      isSelected ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${hasUnread ? 'text-primary' : ''}`}>
                            {otherParticipant
                              ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                              : 'Utilisateur'}
                          </p>
                          {otherParticipant?.company_name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {otherParticipant.company_name}
                            </p>
                          )}
                        </div>
                        {hasUnread && (
                          <Badge variant="default" className="ml-2 h-5 min-w-[20px] flex items-center justify-center px-1.5">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conv.subject && (
                        <p className="text-xs text-muted-foreground mb-1 truncate">
                          {conv.subject}
                        </p>
                      )}

                      {conv.lastMessage && (
                        <p className={`text-xs line-clamp-1 mb-1 ${hasUnread ? 'font-medium' : 'text-muted-foreground'}`}>
                          {conv.lastMessage.sender_id === currentUserId && 'Vous: '}
                          {conv.lastMessage.content}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {conv.last_message_at &&
                          formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

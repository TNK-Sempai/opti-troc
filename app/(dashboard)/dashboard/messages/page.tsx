import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConversationsList } from '@/components/messages/ConversationsList'
import { ConversationView } from '@/components/messages/ConversationView'
import { Card } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ conversation?: string }>
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer les conversations de l'utilisateur
  const { data: conversations } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      last_read_at,
      is_archived,
      conversations (
        id,
        subject,
        listing_id,
        last_message_at,
        updated_at,
        listings (
          id,
          listing_type,
          unit_listings (brand, model),
          lot_listings (description)
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('conversations(last_message_at)', { ascending: false })

  // Enrichir avec les infos des autres participants
  const enrichedConversations = await Promise.all(
    (conversations || []).map(async (conv: any) => {
      const conversation = conv.conversations

      // Récupérer les participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          user_profiles (
            first_name,
            last_name,
            company_name
          )
        `)
        .eq('conversation_id', conversation.id)
        .neq('user_id', user.id)

      // Récupérer le dernier message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Compter les messages non lus
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user.id)
        .gt('created_at', conv.last_read_at)

      return {
        ...conversation,
        participants,
        lastMessage,
        unreadCount: unreadCount || 0,
        userLastReadAt: conv.last_read_at,
      }
    })
  )

  const selectedConversationId = params.conversation

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messagerie</h1>
        <p className="text-muted-foreground mt-2">
          Communiquez avec les autres professionnels et l'équipe Opti-Troc
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-100px)]">
        {/* Liste des conversations */}
        <div className="lg:col-span-1">
          <ConversationsList
            conversations={enrichedConversations}
            selectedId={selectedConversationId}
            currentUserId={user.id}
          />
        </div>

        {/* Vue de la conversation */}
        <div className="lg:col-span-2">
          {selectedConversationId ? (
            <ConversationView
              conversationId={selectedConversationId}
              currentUserId={user.id}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Aucune conversation sélectionnée</p>
                <p className="text-sm">Sélectionnez une conversation dans la liste</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

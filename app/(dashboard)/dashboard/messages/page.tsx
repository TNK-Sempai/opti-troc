import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConversationsList } from '@/components/messages/ConversationsList'
import { ConversationView } from '@/components/messages/ConversationView'
import { Card } from '@/components/ui/card'
import { MessageSquare, Mail, Inbox } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

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

  // Calculer les statistiques
  const totalConversations = enrichedConversations.length
  const unreadConversations = enrichedConversations.filter(c => c.unreadCount > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/20 to-purple-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
              <Mail className="w-10 h-10 text-blue-600" />
              Messagerie
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Communiquez avec les autres professionnels et l'équipe Opti-Troc
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon={Inbox} label="Conversations" value={totalConversations} gradient="primary" />
          <StatCard icon={MessageSquare} label="Non lues" value={unreadConversations} gradient={unreadConversations > 0 ? 'danger' : 'secondary'} />
        </div>

        {/* Messaging layout */}
        <Card className="shadow-xl border-blue-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
          <div className="grid lg:grid-cols-3 h-[calc(100vh-350px)] min-h-[500px]">
            {/* Liste des conversations */}
            <div className="lg:col-span-1 border-r border-blue-100">
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
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/30 to-purple-50/30">
                  <div className="text-center text-muted-foreground p-8">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-12 h-12 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-neutral-700 mb-2">Aucune conversation sélectionnée</p>
                    <p className="text-base font-medium">Sélectionnez une conversation dans la liste pour commencer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

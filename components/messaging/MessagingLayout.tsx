'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { ConversationsList } from './ConversationsList'
import { ConversationView } from './ConversationView'
import { ConversationDetails } from './ConversationDetails'
import type { ConversationData } from './types'

interface MessagingLayoutProps {
  currentUserId: string
  isAdmin: boolean
}

export function MessagingLayout({
  currentUserId,
  isAdmin,
}: MessagingLayoutProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const selectedId = searchParams.get('conversation')
  const selectedConversation =
    conversations.find((c) => c.id === selectedId) || null

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('API /api/conversations error:', res.status, err)
      }
    } catch (e) {
      console.error('Error loading conversations:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  function selectConversation(id: string) {
    setDetailsOpen(false)
    router.replace(`/dashboard/messages?conversation=${id}`, { scroll: false })
  }

  function handleBack() {
    setDetailsOpen(false)
    router.replace('/dashboard/messages', { scroll: false })
  }

  function handleDelete() {
    router.replace('/dashboard/messages', { scroll: false })
    loadConversations()
  }

  return (
    <div className="h-[calc(100dvh-64px)] flex bg-off-white overflow-hidden">
      {/* Left: Conversations list */}
      <div
        className={`w-full lg:w-[380px] lg:min-w-[380px] border-r border-light-grey/50 flex-shrink-0 ${
          selectedId ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
        }`}
      >
        <ConversationsList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={selectConversation}
          loading={loading}
          currentUserId={currentUserId}
        />
      </div>

      {/* Center: Conversation view */}
      <div
        className={`flex-1 min-w-0 ${
          !selectedId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <div className="w-full h-full">
            <ConversationView
              conversation={selectedConversation}
              currentUserId={currentUserId}
              onInfoClick={() => setDetailsOpen(true)}
              onBack={handleBack}
              onMessageActivity={loadConversations}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dust-grey/10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center p-8"
            >
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-pine-teal/10 to-fern/10 rounded-3xl flex items-center justify-center shadow-sm">
                <MessageSquare className="w-10 h-10 text-pine-teal/30" />
              </div>
              <p className="text-lg font-bold text-dark-grey mb-1">
                Vos messages
              </p>
              <p className="text-sm text-medium-grey">
                Sélectionnez une conversation pour commencer
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right: Details sheet */}
      <ConversationDetails
        conversation={selectedConversation}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onDelete={handleDelete}
        currentUserId={currentUserId}
      />
    </div>
  )
}

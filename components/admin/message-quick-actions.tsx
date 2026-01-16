'use client'

import { Button } from '@/components/ui/button'
import { Mail, Trash2, X, CheckCircle, MailOpen } from 'lucide-react'
import { updateMessageStatus, deleteMessage } from '@/app/actions/messages'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface MessageQuickActionsProps {
  message: {
    id: string
    email: string
    status: string
  }
}

export function MessageQuickActions({ message }: MessageQuickActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleReply() {
    if (message.status === 'new') {
      await updateMessageStatus(message.id, 'read')
      router.refresh()
    }
    window.open(`mailto:${message.email}`, '_blank')
  }

  async function handleMarkReplied() {
    setIsLoading(true)
    await updateMessageStatus(message.id, 'replied')
    router.refresh()
    setIsLoading(false)
  }

  async function handleMarkUnread() {
    setIsLoading(true)
    await updateMessageStatus(message.id, 'new')
    router.refresh()
    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce message ?')) return
    setIsLoading(true)
    await deleteMessage(message.id)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={handleReply} disabled={isLoading} size="sm" className="h-8 bg-primary">
        <Mail className="w-3 h-3 mr-1" />
        Répondre
      </Button>

      {message.status !== 'replied' && (
        <Button onClick={handleMarkReplied} disabled={isLoading} variant="outline" size="sm" className="h-8 text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Marquer répondu
        </Button>
      )}

      {message.status === 'replied' && (
        <Button onClick={handleMarkUnread} disabled={isLoading} variant="outline" size="sm" className="h-8">
          <MailOpen className="w-3 h-3 mr-1" />
          Marquer non répondu
        </Button>
      )}

      <Button onClick={handleDelete} disabled={isLoading} variant="outline" size="sm" className="h-8 text-red-600">
        <Trash2 className="w-3 h-3 mr-1" />
        Supprimer
      </Button>
    </div>
  )
}
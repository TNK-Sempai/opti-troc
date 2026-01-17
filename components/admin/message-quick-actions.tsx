'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Archive, X, CheckCircle, MailOpen, Loader2, MessageCircle } from 'lucide-react'
import { updateMessageStatus, archiveMessage } from '@/app/actions/messages'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface MessageQuickActionsProps {
  message: {
    id: string
    name: string
    email: string
    subject: string
    status: string
  }
}

export function MessageQuickActions({ message }: MessageQuickActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailReply() {
    if (message.status === 'new') {
      await updateMessageStatus(message.id, 'read')
      router.refresh()
    }
    window.open(`mailto:${message.email}`, '_blank')
  }

  async function handleInternalReply() {
    if (!replyContent.trim()) {
      setError('Veuillez écrire un message')
      return
    }

    setReplying(true)
    setError(null)

    try {
      // Appeler l'API pour envoyer un message interne
      const response = await fetch('/api/admin/send-internal-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: message.email,
          subject: `Re: ${message.subject}`,
          content: replyContent.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Marquer comme répondu
      await updateMessageStatus(message.id, 'replied')

      setDialogOpen(false)
      setReplyContent('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setReplying(false)
    }
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

  async function handleArchive() {
    if (!confirm('Archiver ce message ? Il sera conservé pendant 5 ans pour conformité légale.')) return
    setIsLoading(true)
    await archiveMessage(message.id)
    router.refresh()
    setIsLoading(false)
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleInternalReply()
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button disabled={isLoading} size="sm" className="h-8 bg-primary">
            <MessageCircle className="w-3 h-3 mr-1" />
            Répondre (interne)
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Répondre par messagerie interne</DialogTitle>
            <DialogDescription>
              Réponse à <span className="font-semibold">{message.name}</span> ({message.email}) concernant:{' '}
              <span className="font-semibold">{message.subject}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez votre réponse... (Entrée pour envoyer)"
                className="min-h-[150px] resize-none"
                disabled={replying}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm flex items-start gap-2">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={replying}
              >
                Annuler
              </Button>
              <Button
                onClick={handleInternalReply}
                disabled={!replyContent.trim() || replying}
              >
                {replying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button onClick={handleEmailReply} disabled={isLoading} variant="outline" size="sm" className="h-8">
        <Mail className="w-3 h-3 mr-1" />
        Email
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

      <Button onClick={handleArchive} disabled={isLoading} variant="outline" size="sm" className="h-8 text-amber-600">
        <Archive className="w-3 h-3 mr-1" />
        Archiver
      </Button>
    </div>
  )
}
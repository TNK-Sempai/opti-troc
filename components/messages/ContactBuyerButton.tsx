'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ContactBuyerButtonProps {
  wantedItemId: string
  buyerName: string
  itemTitle: string
}

export function ContactBuyerButton({
  wantedItemId,
  buyerName,
  itemTitle,
}: ContactBuyerButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!message.trim()) {
      setError('Veuillez écrire un message')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/conversations/start-wanted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wantedItemId,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Rediriger vers la conversation
      router.push(`/dashboard/messages?conversation=${data.conversationId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full text-sm font-semibold bg-gradient-to-r from-pine-teal to-hunter-green hover:from-hunter-green hover:to-hunter-green"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-1.5" />
          J'ai cette paire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Proposer cette paire</DialogTitle>
          <DialogDescription>
            Vous contactez <span className="font-semibold">{buyerName}</span> concernant:{' '}
            <span className="font-semibold">{itemTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Décrivez la paire que vous avez à proposer... (Entrée pour envoyer)"
              className="min-h-[150px] resize-none"
              disabled={loading}
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || loading}
            >
              {loading ? (
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
  )
}

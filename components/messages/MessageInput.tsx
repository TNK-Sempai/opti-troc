'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  conversationId: string
  currentUserId: string
  onMessageSent?: () => void
}

export function MessageInput({
  conversationId,
  currentUserId,
  onMessageSent,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!content.trim()) return

    setSending(true)

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim() }),
    })

    if (res.ok) {
      setContent('')
      onMessageSent?.()
    }

    setSending(false)
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Écrivez votre message... (Entrée pour envoyer)"
        className="min-h-[60px] resize-none"
        disabled={sending}
      />
      <Button
        onClick={handleSend}
        disabled={!content.trim() || sending}
        size="icon"
        className="h-[60px] w-[60px] flex-shrink-0"
      >
        {sending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </div>
  )
}

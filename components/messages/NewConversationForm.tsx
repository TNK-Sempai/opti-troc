'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface NewConversationFormProps {
  currentUserId: string
  users: any[]
  preselectedRecipient?: any
  preselectedListing?: any
}

export function NewConversationForm({
  currentUserId,
  users,
  preselectedRecipient,
  preselectedListing,
}: NewConversationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipientId, setRecipientId] = useState(
    preselectedRecipient?.id || preselectedListing?.seller_id || ''
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!recipientId) {
      setError('Veuillez sélectionner un destinataire')
      setLoading(false)
      return
    }

    if (!message.trim()) {
      setError('Veuillez écrire un message')
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Vérifier si une conversation existe déjà
      const { data: existingConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId)

      if (existingConvs && existingConvs.length > 0) {
        const convIds = existingConvs.map((c) => c.conversation_id)

        const { data: recipientConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', recipientId)
          .in('conversation_id', convIds)

        // Si une conversation existe déjà, rediriger vers celle-ci
        if (recipientConvs && recipientConvs.length > 0) {
          const existingConvId = recipientConvs[0].conversation_id

          // Ajouter le message à la conversation existante
          await supabase.from('messages').insert({
            conversation_id: existingConvId,
            sender_id: currentUserId,
            content: message.trim(),
          })

          router.push(`/dashboard/messages?conversation=${existingConvId}`)
          return
        }
      }

      // Créer une nouvelle conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          subject: subject || null,
          listing_id: preselectedListing?.id || null,
        })
        .select()
        .single()

      if (convError) throw convError

      // Ajouter les participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: currentUserId },
          { conversation_id: conversation.id, user_id: recipientId },
        ])

      if (partError) throw partError

      // Ajouter le premier message
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: message.trim(),
      })

      if (msgError) throw msgError

      router.push(`/dashboard/messages?conversation=${conversation.id}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const listingInfo = preselectedListing
    ? preselectedListing.listing_type === 'unit'
      ? `${preselectedListing.unit_listings[0]?.brand} ${preselectedListing.unit_listings[0]?.model}`
      : `Lot - ${preselectedListing.lot_listings[0]?.description?.substring(0, 50)}...`
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Destinataire */}
      <div>
        <Label>Destinataire *</Label>
        {preselectedRecipient ? (
          <Input
            value={`${preselectedRecipient.first_name} ${preselectedRecipient.last_name} - ${preselectedRecipient.company_name}`}
            disabled
            className="mt-1"
          />
        ) : (
          <Select value={recipientId} onValueChange={setRecipientId} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionnez un destinataire" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                  {user.company_name && ` - ${user.company_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Sujet */}
      <div>
        <Label htmlFor="subject">Sujet</Label>
        <Input
          id="subject"
          name="subject"
          defaultValue={listingInfo ? `Concernant: ${listingInfo}` : ''}
          placeholder="Sujet de la conversation (optionnel)"
          className="mt-1"
        />
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Écrivez votre message..."
          className="mt-1 min-h-[150px]"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi...
            </>
          ) : (
            'Envoyer le message'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tag,
  CalendarCheck,
  HelpCircle,
  Flag,
  Trash2,
  Ban,
  Image as ImageIcon,
} from 'lucide-react'
import type { ConversationData } from './types'

interface ConversationDetailsProps {
  conversation: ConversationData | null
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

function getListingInfo(conv: ConversationData) {
  if (!conv.listings) return { title: null, photo: null }
  const listing = conv.listings
  if (listing.listing_type === 'unit') {
    const unit = listing.unit_listings?.[0]
    return {
      title: unit ? `${unit.brand} ${unit.model}`.trim() : null,
      photo: unit?.photos?.[0] || null,
      condition: unit?.condition || null,
      reference: unit?.reference || null,
    }
  }
  const lot = listing.lot_listings?.[0]
  return {
    title: lot ? lot.description?.slice(0, 80) || 'Lot' : null,
    photo: lot?.photos?.[0] || null,
    condition: null,
    reference: null,
  }
}

const actions = [
  { icon: Tag, label: 'Marquer comme vendu', color: 'text-fern', hoverBg: 'hover:bg-fern/5', action: 'sold', listingOnly: true },
  { icon: CalendarCheck, label: 'Réserver', color: 'text-pine-teal', hoverBg: 'hover:bg-pine-teal/5', action: 'reserve', listingOnly: true },
  { icon: HelpCircle, label: 'Aide', color: 'text-dark-grey', hoverBg: 'hover:bg-dust-grey/50', action: 'help', listingOnly: false },
  { icon: Flag, label: 'Signaler', color: 'text-red-500', hoverBg: 'hover:bg-red-50', action: 'report', listingOnly: false },
  { icon: Trash2, label: 'Supprimer la conversation', color: 'text-red-500', hoverBg: 'hover:bg-red-50', action: 'delete', listingOnly: false },
  { icon: Ban, label: 'Bloquer cet utilisateur', color: 'text-red-500', hoverBg: 'hover:bg-red-50', action: 'block', listingOnly: false },
]

export function ConversationDetails({
  conversation,
  isOpen,
  onClose,
  onDelete,
}: ConversationDetailsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  if (!conversation) return null

  const { title: listingTitle, photo: listingPhoto, condition, reference } = getListingInfo(conversation)
  const participant = conversation.otherParticipant
  const initials = participant
    ? `${participant.first_name?.[0] || ''}${participant.last_name?.[0] || ''}`.toUpperCase()
    : '?'

  async function handleAction(action: string) {
    if (action === 'delete') {
      if (!confirm('Supprimer cette conversation ? Elle sera retirée de votre liste.')) return
      setActionLoading('delete')
      try {
        const res = await fetch(`/api/conversations/${conversation!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'archive' }),
        })
        if (res.ok) {
          onDelete()
          onClose()
        }
      } finally {
        setActionLoading(null)
      }
      return
    }

    if (action === 'help') {
      window.open('/contact', '_blank')
      return
    }

    // Placeholder for other actions
    alert('Cette fonctionnalité sera bientôt disponible.')
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-off-white border-l-light-grey/60"
      >
        <SheetHeader className="p-5 border-b border-light-grey/50">
          <SheetTitle className="text-lg font-bold text-charcoal">
            Détails
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto flex-1">
          {/* Participant info */}
          {participant && (
            <div className="p-5 border-b border-light-grey/40">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pine-teal/15 to-fern/15 flex items-center justify-center text-lg font-bold text-pine-teal shadow-sm">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-charcoal text-[15px]">
                    {participant.first_name} {participant.last_name}
                  </p>
                  {participant.company_name && (
                    <p className="text-sm text-medium-grey">
                      {participant.company_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Listing card */}
          {conversation.listings && (
            <div className="p-5 border-b border-light-grey/40">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-light-grey/50">
                {listingPhoto ? (
                  <img
                    src={listingPhoto}
                    alt={listingTitle || ''}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-dust-grey/50 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-dry-sage/60" />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-bold text-charcoal text-[15px] mb-1.5">
                    {listingTitle || conversation.subject || 'Annonce'}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    {condition && (
                      <span className="text-[11px] bg-fern/10 text-fern font-bold px-2.5 py-0.5 rounded-full">
                        {condition}
                      </span>
                    )}
                    {reference && (
                      <span className="text-[11px] text-medium-grey font-mono bg-dust-grey/40 px-2 py-0.5 rounded">
                        Réf: {reference}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gold">
                    {conversation.listings.price?.toLocaleString('fr-FR')} €
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4">
            <p className="text-[11px] text-medium-grey/70 font-semibold uppercase tracking-wider mb-2 px-2">
              Actions
            </p>
            <div className="space-y-0.5">
              {actions.map(({ icon: Icon, label, color, hoverBg, action, listingOnly }) => {
                if (listingOnly && !conversation.listings) return null
                return (
                  <button
                    key={action}
                    onClick={() => handleAction(action)}
                    disabled={actionLoading === action}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${hoverBg} transition-colors text-left ${
                      actionLoading === action ? 'opacity-50' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span
                      className={`text-sm font-medium ${
                        action === 'delete' || action === 'block' || action === 'report'
                          ? 'text-red-500'
                          : 'text-dark-grey'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

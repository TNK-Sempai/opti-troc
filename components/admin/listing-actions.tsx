'use client'

import { Button } from '@/components/ui/button'
import { Ban, Trash2, ShieldAlert, Play } from 'lucide-react'
import { suspendListing, deleteListing, banListing, reactivateListing } from '@/app/(admin)/admin/listings/[id]/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ListingActionsProps {
  listingId: string
  currentStatus: string
}

export function ListingActions({ listingId, currentStatus }: ListingActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSuspend() {
    if (!confirm('Suspendre cette annonce temporairement ?')) return
    setIsLoading(true)
    const result = await suspendListing(listingId)
    if (result.success) {
      router.refresh()
    } else {
      alert('Erreur: ' + result.error)
    }
    setIsLoading(false)
  }

  async function handleReactivate() {
    if (!confirm('Réactiver cette annonce ?')) return
    setIsLoading(true)
    const result = await reactivateListing(listingId)
    if (result.success) {
      router.refresh()
    } else {
      alert('Erreur: ' + result.error)
    }
    setIsLoading(false)
  }

  async function handleBan() {
    const reason = prompt('⚠️ Raison du bannissement (sera envoyée au vendeur par email) :')
    if (!reason || reason.trim() === '') {
      alert('Vous devez fournir une raison')
      return
    }
    
    if (!confirm(`Confirmer le bannissement pour la raison : "${reason}" ?`)) return
    
    setIsLoading(true)
    const result = await banListing(listingId, reason)
    if (result.success) {
      alert('Annonce bannie. (Email désactivé - à configurer avec Resend)')
      router.refresh()
    } else {
      alert('Erreur: ' + result.error)
    }
    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('🗑️ SUPPRIMER définitivement cette annonce de la base de données ?')) return
    setIsLoading(true)
    const result = await deleteListing(listingId)
    if (result.success) {
      router.push('/admin/listings')
    } else {
      alert('Erreur: ' + result.error)
    }
    setIsLoading(false)
  }

  return (
    <>
      {currentStatus === 'active' && (
        <Button onClick={handleSuspend} disabled={isLoading} variant="outline" size="sm" className="text-yellow-600">
          <Ban className="w-4 h-4 mr-2" />
          Suspendre
        </Button>
      )}
      
      {(currentStatus === 'suspended' || currentStatus === 'paused') && (
        <Button onClick={handleReactivate} disabled={isLoading} variant="outline" size="sm" className="text-green-600">
          <Play className="w-4 h-4 mr-2" />
          Réactiver
        </Button>
      )}

      {currentStatus !== 'banned' && (
        <Button onClick={handleBan} disabled={isLoading} variant="outline" size="sm" className="text-orange-600">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Bannir
        </Button>
      )}
      
      <Button onClick={handleDelete} disabled={isLoading} variant="outline" size="sm" className="text-red-600">
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer
      </Button>
    </>
  )
}
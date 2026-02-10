'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Ban, Archive, Trash2 } from 'lucide-react'
import { validateUser, rejectUser, suspendUser, reactivateUser, archiveUser, deleteArchivedUser, forceDeleteUser } from '@/app/actions/users'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserActionButtonsProps {
  userId: string
  status: string
}

export function UserActionButtons({ userId, status }: UserActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleValidate() {
    if (!confirm('Valider cet utilisateur ?')) return
    setIsLoading(true)
    const result = await validateUser(userId)
    if (result.success) {
      router.refresh()
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  async function handleReject() {
    if (!confirm('Rejeter cet utilisateur ? Cette action est définitive.')) return
    setIsLoading(true)
    const result = await rejectUser(userId)
    if (result.success) {
      router.refresh()
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  async function handleSuspend() {
    if (!confirm('Suspendre cet utilisateur ? Il ne pourra plus se connecter.')) return
    setIsLoading(true)
    const result = await suspendUser(userId)
    if (result.success) {
      router.refresh()
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  async function handleReactivate() {
    if (!confirm('Réactiver cet utilisateur ?')) return
    setIsLoading(true)
    const result = await reactivateUser(userId)
    if (result.success) {
      router.refresh()
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  async function handleArchive() {
    const reason = prompt('Raison de l\'archivage (optionnel) :')
    if (reason === null) return // User cancelled

    if (!confirm('Archiver cet utilisateur ? Il sera conservé pendant 5 ans pour conformité légale (RGPD).')) return
    setIsLoading(true)
    const result = await archiveUser(userId, reason || undefined)
    if (result.success) {
      router.refresh()
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('⚠️ ATTENTION : Supprimer définitivement cet utilisateur archivé ? Cette action est IRRÉVERSIBLE et ne peut être effectuée que si la période d\'archivage est expirée.')) return
    setIsLoading(true)
    const result = await deleteArchivedUser(userId)
    if (result.success) {
      alert('Utilisateur supprimé définitivement')
      router.push('/admin/users')
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  async function handleForceDelete() {
    if (!confirm('⚠️ Supprimer définitivement cet utilisateur et son compte auth ? Cette action est IRRÉVERSIBLE.')) return
    setIsLoading(true)
    const result = await forceDeleteUser(userId)
    if (result.success) {
      alert('Utilisateur supprimé définitivement')
      router.push('/admin/users')
    } else {
      alert(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleValidate}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Valider
        </Button>
        <Button
          onClick={handleReject}
          disabled={isLoading}
          variant="outline"
          className="text-red-600"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejeter
        </Button>
        <Button
          onClick={handleForceDelete}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    )
  }

  if (status === 'incomplete') {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleForceDelete}
          disabled={isLoading}
          variant="outline"
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleForceDelete}
          disabled={isLoading}
          variant="outline"
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    )
  }

  if (status === 'validated') {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleSuspend}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full text-orange-600"
        >
          <Ban className="w-4 h-4 mr-2" />
          Suspendre
        </Button>
        <Button
          onClick={handleArchive}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full text-amber-600"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archiver
        </Button>
      </div>
    )
  }

  if (status === 'suspended') {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleReactivate}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full text-green-600"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Réactiver
        </Button>
        <Button
          onClick={handleArchive}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full text-amber-600"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archiver
        </Button>
      </div>
    )
  }

  if (status === 'archived') {
    return (
      <Button
        onClick={handleDelete}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full text-red-600"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer définitivement
      </Button>
    )
  }

  return null
}

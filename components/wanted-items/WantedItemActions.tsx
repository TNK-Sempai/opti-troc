'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { MoreVertical, Edit, Pause, Trash2, Play, Loader2 } from 'lucide-react'

interface WantedItemActionsProps {
  item: any
}

export function WantedItemActions({ item }: WantedItemActionsProps) {
  const router = useRouter()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = item.status === 'active'
  const isCancelled = item.status === 'cancelled'

  async function handleToggleStatus() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const newStatus = isActive ? 'cancelled' : 'active'

    const { error: updateError } = await supabase
      .from('wanted_items')
      .update({ status: newStatus })
      .eq('id', item.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('wanted_items')
      .delete()
      .eq('id', item.id)

    if (deleteError) {
      setError(deleteError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setDeleteDialogOpen(false)
    router.refresh()
  }

  async function handleEdit(formData: FormData) {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('wanted_items')
      .update({
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        reference: formData.get('reference') as string,
        description: formData.get('description') as string,
        max_price: formData.get('max_price') ? parseFloat(formData.get('max_price') as string) : null,
      })
      .eq('id', item.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setEditDialogOpen(false)
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={loading}>
            {isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Suspendre
              </>
            ) : isCancelled ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Réactiver
              </>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Modifier */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la recherche</DialogTitle>
            <DialogDescription>
              Modifiez les critères de votre recherche
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(new FormData(e.currentTarget))
            }}
          >
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-brand">Marque *</Label>
                <Input
                  id="edit-brand"
                  name="brand"
                  defaultValue={item.brand}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-model">Modèle</Label>
                <Input
                  id="edit-model"
                  name="model"
                  defaultValue={item.model || ''}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-reference">Référence</Label>
                <Input
                  id="edit-reference"
                  name="reference"
                  defaultValue={item.reference || ''}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-max_price">Budget maximum (€)</Label>
                <Input
                  id="edit-max_price"
                  name="max_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={item.max_price || ''}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={item.description || ''}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Supprimer */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la recherche</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette recherche ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

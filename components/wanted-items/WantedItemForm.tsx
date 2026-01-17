'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function WantedItemForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      reference: formData.get('reference') as string,
      description: formData.get('description') as string,
      max_price: formData.get('max_price') ? parseFloat(formData.get('max_price') as string) : null,
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Vous devez être connecté')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('wanted_items')
      .insert({
        user_id: user.id,
        ...data,
        status: 'active'
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Reset form
    form.reset()
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="brand">Marque *</Label>
        <Input
          id="brand"
          name="brand"
          required
          placeholder="Ex: Ray-Ban, Oakley..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="model">Modèle</Label>
        <Input
          id="model"
          name="model"
          placeholder="Ex: Wayfarer, Holbrook..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="reference">Référence</Label>
        <Input
          id="reference"
          name="reference"
          placeholder="Ex: RB2140, OO9102..."
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          La référence exacte améliore la précision de la recherche
        </p>
      </div>

      <div>
        <Label htmlFor="max_price">Budget maximum (€)</Label>
        <Input
          id="max_price"
          name="max_price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 150.00"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description / Notes</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Ajoutez des détails supplémentaires sur ce que vous recherchez..."
          className="mt-1"
          rows={3}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Créer la recherche'
        )}
      </Button>
    </form>
  )
}

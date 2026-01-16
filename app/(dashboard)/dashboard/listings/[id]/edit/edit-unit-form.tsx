'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/ui/file-upload'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, ArrowLeft, X } from 'lucide-react'
import { z } from 'zod'
import Image from 'next/image'
import { uploadMultipleFiles } from '@/lib/cloudinary/client-upload'
import { updateUnitListing } from './actions'

const editUnitSchema = z.object({
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(255),
  reference: z.string().max(100).optional(),
  gender: z.enum(['homme', 'femme', 'mixte', 'enfant']),
  category: z.enum(['vue', 'solaires', 'sport']),
  state: z.enum(['neuf_etiquette', 'neuf_sans_etiquette', 'tres_bon', 'bon']),
  colorFrame: z.string().max(100).optional(),
  colorLens: z.string().max(100).optional(),
  material: z.string().max(100).optional(),
  sizeLens: z.string().max(20).optional(),
  sizeBridge: z.string().max(20).optional(),
  sizeTemple: z.string().max(20).optional(),
  price: z.number().positive().max(999999.99),
  description: z.string().min(20).max(2000),
  allowHandDelivery: z.boolean(),
  newPhotos: z.array(z.instanceof(File)).max(5).optional(),
})

type EditUnitForm = z.infer<typeof editUnitSchema>

interface EditUnitListingFormProps {
  listing: any
  details: any
  photos: any[]
}

export default function EditUnitListingForm({ listing, details, photos }: EditUnitListingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingPhotos, setExistingPhotos] = useState(photos)

  const form = useForm<EditUnitForm>({
    resolver: zodResolver(editUnitSchema),
    defaultValues: {
      brand: details.brand || '',
      model: details.model || '',
      reference: details.reference || '',
      gender: details.gender,
      category: details.category,
      state: details.state,
      colorFrame: details.color_frame || '',
      colorLens: details.color_lens || '',
      material: details.material || '',
      sizeLens: details.size_lens || '',
      sizeBridge: details.size_bridge || '',
      sizeTemple: details.size_temple || '',
      price: parseFloat(details.price),
      allowHandDelivery: details.allow_hand_delivery || false,
      description: details.description || '',
    },
  })

  const removeExistingPhoto = (photoId: string) => {
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const onSubmit = async (data: EditUnitForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Upload nouvelles photos si présentes
      let newPhotosUrls: { url: string; publicId: string }[] = []
      
      if (data.newPhotos && data.newPhotos.length > 0) {
        setError('Upload des nouvelles photos...')
        newPhotosUrls = await uploadMultipleFiles(data.newPhotos, 'opti-troc/listings')
      }

      // Mettre à jour l'annonce
      setError('Mise à jour de l\'annonce...')
      const result = await updateUnitListing({
        listingId: listing.id,
        brand: data.brand,
        model: data.model,
        reference: data.reference || '',
        gender: data.gender,
        category: data.category,
        state: data.state,
        colorFrame: data.colorFrame,
        colorLens: data.colorLens,
        material: data.material,
        sizeLens: data.sizeLens,
        sizeBridge: data.sizeBridge,
        sizeTemple: data.sizeTemple,
        price: data.price,
        allowHandDelivery: data.allowHandDelivery,
        description: data.description,
        existingPhotoIds: existingPhotos.map(p => p.id),
        newPhotosUrls,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      router.push(`/dashboard/listings/${listing.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier l'annonce unitaire</CardTitle>
          <CardDescription>Modifiez les informations de votre annonce</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photos existantes */}
            {existingPhotos.length > 0 && (
              <div>
                <Label className="mb-2 block">Photos actuelles</Label>
                <div className="grid grid-cols-3 gap-3">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={photo.photo_url}
                          alt="Photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingPhoto(photo.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {photo.is_primary && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                            Principale
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles photos */}
            <div>
              <Label>Ajouter de nouvelles photos (optionnel)</Label>
              <p className="text-sm text-neutral-500 mb-2">
                Maximum 5 photos au total (actuelles + nouvelles)
              </p>
              <FileUpload
                accept="image/*"
                multiple
                onFilesChange={(files) => form.setValue('newPhotos', files)}
                value={form.watch('newPhotos') || []}
                error={form.formState.errors.newPhotos?.message}
              />
            </div>

            {/* Produit */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marque *</Label>
                <Input id="brand" {...form.register('brand')} />
                {form.formState.errors.brand && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.brand.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="model">Modèle *</Label>
                <Input id="model" {...form.register('model')} />
                {form.formState.errors.model && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.model.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="reference">Référence</Label>
              <Input id="reference" {...form.register('reference')} />
            </div>

            {/* Genre et Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Genre *</Label>
                <Select
                  value={form.watch('gender')}
                  onValueChange={(value) => form.setValue('gender', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homme">👨 Homme</SelectItem>
                    <SelectItem value="femme">👩 Femme</SelectItem>
                    <SelectItem value="mixte">👤 Mixte</SelectItem>
                    <SelectItem value="enfant">👶 Enfant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type *</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(value) => form.setValue('category', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vue">🕶️ Optique (Vue)</SelectItem>
                    <SelectItem value="solaires">😎 Solaires</SelectItem>
                    <SelectItem value="sport">🏃 Sport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* État */}
            <div>
              <Label>État *</Label>
              <Select
                value={form.watch('state')}
                onValueChange={(value) => form.setValue('state', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neuf_etiquette">✨ Neuf avec étiquette</SelectItem>
                  <SelectItem value="neuf_sans_etiquette">🌟 Neuf sans étiquette</SelectItem>
                  <SelectItem value="tres_bon">👍 Très bon état</SelectItem>
                  <SelectItem value="bon">👌 Bon état</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Couleurs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="colorFrame">Couleur monture</Label>
                <Input id="colorFrame" {...form.register('colorFrame')} />
              </div>
              <div>
                <Label htmlFor="colorLens">Couleur verres</Label>
                <Input id="colorLens" {...form.register('colorLens')} />
              </div>
            </div>

            {/* Matériau */}
            <div>
              <Label htmlFor="material">Matériau</Label>
              <Input id="material" {...form.register('material')} />
            </div>

            {/* Dimensions */}
            <div>
              <Label className="mb-2 block">Dimensions (mm)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sizeLens" className="text-xs text-neutral-500">Verres</Label>
                  <Input id="sizeLens" {...form.register('sizeLens')} placeholder="52" />
                </div>
                <div>
                  <Label htmlFor="sizeBridge" className="text-xs text-neutral-500">Pont</Label>
                  <Input id="sizeBridge" {...form.register('sizeBridge')} placeholder="21" />
                </div>
                <div>
                  <Label htmlFor="sizeTemple" className="text-xs text-neutral-500">Branches</Label>
                  <Input id="sizeTemple" {...form.register('sizeTemple')} placeholder="140" />
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="handDelivery"
                    checked={form.watch('allowHandDelivery')}
                    onCheckedChange={(checked) => form.setValue('allowHandDelivery', checked as boolean)}
                  />
                  <label htmlFor="handDelivery" className="text-sm cursor-pointer">
                    Remise en main propre possible
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...form.register('description')} rows={4} />
              {form.formState.errors.description && (
                <p className="text-sm text-error mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {error || 'Mise à jour...'}
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
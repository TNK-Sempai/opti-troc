'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { AlertCircle, Loader2, ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { z } from 'zod'
import Image from 'next/image'
import { uploadMultipleFiles } from '@/lib/cloudinary/client-upload'
import { updateLotListing } from './actions'

const editLotSchema = z.object({
  totalPrice: z.number().positive().max(999999.99),
  description: z.string().min(20).max(2000),
  allowPartialSale: z.boolean(),
  items: z.array(
    z.object({
      id: z.string().optional(), // ID existant pour mise à jour
      brand: z.string().min(1).max(100),
      model: z.string().min(1).max(255),
      reference: z.string().max(100).optional(),
      state: z.enum(['neuf_etiquette', 'neuf_sans_etiquette', 'tres_bon', 'bon']),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  newPhotos: z.array(z.instanceof(File)).max(10).optional(),
})

type EditLotForm = z.infer<typeof editLotSchema>

interface EditLotListingFormProps {
  listing: any
  details: any
  items: any[]
  photos: any[]
}

export default function EditLotListingForm({ listing, details, items, photos }: EditLotListingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingPhotos, setExistingPhotos] = useState(photos)

  const form = useForm<EditLotForm>({
    resolver: zodResolver(editLotSchema),
    defaultValues: {
      totalPrice: parseFloat(details.total_price),
      allowPartialSale: details.allow_partial_sale || false,
      description: details.description || '',
      items: items.map(item => ({
        id: item.id,
        brand: item.brand,
        model: item.model,
        reference: item.reference || '',
        state: item.state,
        quantity: item.quantity,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const removeExistingPhoto = (photoId: string) => {
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const onSubmit = async (data: EditLotForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Upload nouvelles photos
      let newPhotosUrls: { url: string; publicId: string }[] = []
      
      if (data.newPhotos && data.newPhotos.length > 0) {
        setError('Upload des nouvelles photos...')
        newPhotosUrls = await uploadMultipleFiles(data.newPhotos, 'opti-troc/listings')
      }

      // Mettre à jour
      setError('Mise à jour du lot...')
      const result = await updateLotListing({
        listingId: listing.id,
        totalPrice: data.totalPrice,
        allowPartialSale: data.allowPartialSale,
        description: data.description,
        items: data.items,
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le lot</CardTitle>
          <CardDescription>Modifiez les informations de votre lot</CardDescription>
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
                        <Image src={photo.photo_url} alt="Photo" fill className="object-cover" />
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles photos */}
            <div>
              <Label>Ajouter de nouvelles photos (optionnel)</Label>
              <FileUpload
                accept="image/*"
                multiple
                onFilesChange={(files) => form.setValue('newPhotos', files)}
                value={form.watch('newPhotos') || []}
              />
            </div>

            {/* Items du lot */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Articles du lot *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ brand: '', model: '', reference: '', state: 'neuf_etiquette', quantity: 1 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-sm">Article {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4 text-error" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Marque *</Label>
                          <Input {...form.register(`items.${index}.brand`)} />
                        </div>
                        <div>
                          <Label>Modèle *</Label>
                          <Input {...form.register(`items.${index}.model`)} />
                        </div>
                        <div>
                          <Label>Référence</Label>
                          <Input {...form.register(`items.${index}.reference`)} />
                        </div>
                        <div>
                          <Label>État *</Label>
                          <Select
                            value={form.watch(`items.${index}.state`)}
                            onValueChange={(value) => form.setValue(`items.${index}.state`, value as any)}
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
                        <div>
                          <Label>Quantité *</Label>
                          <Input
                            type="number"
                            {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalPrice">Prix total du lot (€) *</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  {...form.register('totalPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.totalPrice && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.totalPrice.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="partialSale"
                    checked={form.watch('allowPartialSale')}
                    onCheckedChange={(checked) => form.setValue('allowPartialSale', checked as boolean)}
                  />
                  <label htmlFor="partialSale" className="text-sm cursor-pointer">
                    Accepter la vente partielle
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description du lot *</Label>
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
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700">
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
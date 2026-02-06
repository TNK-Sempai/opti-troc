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
import { AlertCircle, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { lotListingSchema, type LotListingForm } from '@/lib/validations/listing'
import { uploadMultipleFiles } from '@/lib/cloudinary/client-upload'
import { createLotListing } from './actions'

interface LotListingFormProps {
  onBack: () => void
}

export default function LotListingForm({ onBack }: LotListingFormProps) {
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LotListingForm>({
    resolver: zodResolver(lotListingSchema),
    defaultValues: {
      allowPartialSale: false,
      items: [
        { brand: '', model: '', reference: '', state: 'neuf_etiquette', quantity: 1 }
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const onSubmit = async (data: LotListingForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload photos
      setError('Upload des photos...')
      const photosUrls = await uploadMultipleFiles(
        data.photos,
        'opti-troc/listings'
      )

      // 2. Créer l'annonce
      setError('Création du lot...')
      const result = await createLotListing({
        totalPrice: data.totalPrice,
        allowPartialSale: data.allowPartialSale,
        description: data.description,
        items: data.items,
        photosUrls,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Redirection
      router.push('/dashboard/listings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vente par lot</CardTitle>
          <CardDescription>
            Vendez plusieurs montures en une seule annonce
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <Label htmlFor={`items.${index}.brand`}>Marque *</Label>
                          <Input
                            id={`items.${index}.brand`}
                            {...form.register(`items.${index}.brand`)}
                            placeholder="Ex: Ray-Ban"
                          />
                          {form.formState.errors.items?.[index]?.brand && (
                            <p className="text-sm text-error mt-1">
                              {form.formState.errors.items[index]?.brand?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`items.${index}.model`}>Modèle *</Label>
                          <Input
                            id={`items.${index}.model`}
                            {...form.register(`items.${index}.model`)}
                            placeholder="Ex: Aviator"
                          />
                          {form.formState.errors.items?.[index]?.model && (
                            <p className="text-sm text-error mt-1">
                              {form.formState.errors.items[index]?.model?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`items.${index}.reference`}>Référence</Label>
                          <Input
                            id={`items.${index}.reference`}
                            {...form.register(`items.${index}.reference`)}
                            placeholder="Ex: RB3025-001"
                          />
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
                          <Label htmlFor={`items.${index}.quantity`}>Quantité *</Label>
                          <Input
                            id={`items.${index}.quantity`}
                            type="number"
                            {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                            placeholder="1"
                          />
                          {form.formState.errors.items?.[index]?.quantity && (
                            <p className="text-sm text-error mt-1">
                              {form.formState.errors.items[index]?.quantity?.message}
                            </p>
                          )}
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
                  placeholder="0.00"
                />
                {form.formState.errors.totalPrice && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.totalPrice.message}
                  </p>
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
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Décrivez le lot, l'état général, les accessoires inclus..."
                rows={4}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Photos */}
            <div>
              <Label>Photos * (1 à 10 photos)</Label>
              <p className="text-sm text-medium-grey mb-2">
                Photographiez le lot dans son ensemble et quelques détails
              </p>
              <FileUpload
                accept="image/*"
                multiple
                onFilesChange={(files) => form.setValue('photos', files)}
                value={form.watch('photos') || []}
                error={form.formState.errors.photos?.message}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-fern hover:bg-hunter-green">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {error || 'Publication...'}
                  </>
                ) : (
                  'Publier le lot'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
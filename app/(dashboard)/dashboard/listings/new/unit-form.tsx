'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/ui/file-upload'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, ArrowLeft, Info } from 'lucide-react'
import { unitListingSchema, type UnitListingForm } from '@/lib/validations/listing'
import { uploadMultipleFiles } from '@/lib/cloudinary/client-upload'
import { createUnitListing } from './actions'

interface UnitListingFormProps {
  onBack: () => void
}

export default function UnitListingForm({ onBack }: UnitListingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [references, setReferences] = useState<any[]>([])
  
  const [useManualEntry, setUseManualEntry] = useState(false)

  const form = useForm<UnitListingForm>({
    resolver: zodResolver(unitListingSchema),
    defaultValues: {
      allowHandDelivery: false,
    },
  })

  const gender = form.watch('gender')
  const category = form.watch('category')
  const brandId = form.watch('brandId')
  const modelId = form.watch('modelId')
  const referenceId = form.watch('referenceId')

  // Charger les marques quand gender + category changent
  useEffect(() => {
    if (gender && category && !useManualEntry) {
      loadBrands()
    } else {
      setBrands([])
      setModels([])
      setReferences([])
    }
  }, [gender, category, useManualEntry])

  // Charger les modèles quand la marque change
  useEffect(() => {
    if (brandId && gender && category && !useManualEntry) {
      loadModels()
    } else {
      setModels([])
      setReferences([])
    }
  }, [brandId, useManualEntry])

  // Charger les références quand le modèle change
  useEffect(() => {
    if (modelId && !useManualEntry) {
      loadReferences()
    } else {
      setReferences([])
    }
  }, [modelId, useManualEntry])

  // Auto-remplir depuis une référence
  useEffect(() => {
    if (referenceId) {
      autoFillFromReference()
    }
  }, [referenceId])

  async function loadBrands() {
    const { data: modelsData } = await supabase
      .from('models')
      .select('brand_id')
      .eq('gender', gender)
      .eq('type', category)
      .eq('is_active', true)

    if (!modelsData || modelsData.length === 0) {
      setBrands([])
      return
    }

    const brandIds = [...new Set(modelsData.map(m => m.brand_id))]

    const { data: brandsData } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', brandIds)
      .eq('is_active', true)
      .order('name')

    setBrands(brandsData || [])
  }

  async function loadModels() {
    const { data } = await supabase
      .from('models')
      .select('id, name')
      .eq('brand_id', brandId)
      .eq('gender', gender)
      .eq('type', category)
      .eq('is_active', true)
      .order('name')

    setModels(data || [])
  }

  async function loadReferences() {
    const { data } = await supabase
      .from('product_references')
      .select('*')
      .eq('model_id', modelId)
      .eq('is_active', true)
      .order('reference')

    setReferences(data || [])
  }

  async function autoFillFromReference() {
    const { data } = await supabase
      .from('product_references')
      .select('*')
      .eq('id', referenceId)
      .single()

    if (data) {
      form.setValue('colorFrame', data.color_frame || '')
      form.setValue('colorLens', data.color_lens || '')
      form.setValue('material', data.material_frame || '')
      form.setValue('sizeLens', data.size_lens || '')
      form.setValue('sizeBridge', data.size_bridge || '')
      form.setValue('sizeTemple', data.size_temple || '')
    }
  }

  const onSubmit = async (data: UnitListingForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload photos
      setError('Upload des photos...')
      const photosUrls = await uploadMultipleFiles(data.photos, 'opti-troc/listings')

      // 2. Récupérer les noms
      let brandName = data.customBrand || ''
      let modelName = data.customModel || ''
      let referenceName = data.customReference || ''

      if (!useManualEntry && data.brandId && data.modelId) {
        const { data: brandData } = await supabase
          .from('brands')
          .select('name')
          .eq('id', data.brandId)
          .single()
        
        const { data: modelData } = await supabase
          .from('models')
          .select('name')
          .eq('id', data.modelId)
          .single()

        brandName = brandData?.name || ''
        modelName = modelData?.name || ''

        if (data.referenceId) {
          const { data: refData } = await supabase
            .from('product_references')
            .select('reference')
            .eq('id', data.referenceId)
            .single()
          
          referenceName = refData?.reference || ''
        }
      }

      // 3. Créer l'annonce
      setError('Création de l\'annonce...')
      const result = await createUnitListing({
        brand: brandName,
        model: modelName,
        reference: referenceName,
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
        photosUrls,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      router.push('/dashboard/listings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vente unitaire</CardTitle>
          <CardDescription>Vendez une monture ou une paire de lunettes</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sexe */}
            <div>
              <Label>Sexe *</Label>
              <Select onValueChange={(value) => form.setValue('gender', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homme">👨 Homme</SelectItem>
                  <SelectItem value="femme">👩 Femme</SelectItem>
                  <SelectItem value="mixte">👤 Mixte</SelectItem>
                  <SelectItem value="enfant">👶 Enfant</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-error mt-1">{form.formState.errors.gender.message}</p>
              )}
            </div>

            {/* Type */}
            {gender && (
              <div>
                <Label>Type *</Label>
                <Select onValueChange={(value) => form.setValue('category', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vue">🕶️ Optique (Vue)</SelectItem>
                    <SelectItem value="solaires">😎 Solaires</SelectItem>
                    <SelectItem value="sport">🏃 Sport</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>
            )}

            {/* Option saisie manuelle */}
            {category && (
              <div className="flex items-center space-x-2 p-4 bg-dust-grey rounded-lg">
                <Checkbox
                  id="manual"
                  checked={useManualEntry}
                  onCheckedChange={(checked) => {
                    setUseManualEntry(checked as boolean)
                    // Reset cascade fields
                    form.setValue('brandId', undefined)
                    form.setValue('modelId', undefined)
                    form.setValue('referenceId', undefined)
                  }}
                />
                <label htmlFor="manual" className="text-sm cursor-pointer">
                  Mon produit n'est pas dans le catalogue (saisie manuelle)
                </label>
              </div>
            )}

            {/* Mode catalogue */}
            {category && !useManualEntry && (
              <>
                {brands.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Aucune marque disponible pour cette combinaison. Utilisez la saisie manuelle.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Marque */}
                    <div>
                      <Label>Marque *</Label>
                      <Select onValueChange={(value) => form.setValue('brandId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une marque" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand: any) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Modèle */}
                    {brandId && models.length > 0 && (
                      <div>
                        <Label>Modèle *</Label>
                        <Select onValueChange={(value) => form.setValue('modelId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un modèle" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Référence (optionnel) */}
                    {modelId && references.length > 0 && (
                      <div>
                        <Label>Référence / Couleur (optionnel)</Label>
                        <Select onValueChange={(value) => form.setValue('referenceId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une référence" />
                          </SelectTrigger>
                          <SelectContent>
                            {references.map((ref) => (
                              <SelectItem key={ref.id} value={ref.id}>
                                {ref.reference} - {ref.color_frame} / {ref.color_lens}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-medium-grey mt-1">
                          Auto-remplit les détails du produit
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Mode saisie manuelle */}
            {category && useManualEntry && (
              <>
                <div>
                  <Label htmlFor="customBrand">Marque *</Label>
                  <Input
                    id="customBrand"
                    {...form.register('customBrand')}
                    placeholder="Ex: Ray-Ban"
                  />
                </div>

                <div>
                  <Label htmlFor="customModel">Modèle *</Label>
                  <Input
                    id="customModel"
                    {...form.register('customModel')}
                    placeholder="Ex: Aviator"
                  />
                </div>

                <div>
                  <Label htmlFor="customReference">Référence (optionnel)</Label>
                  <Input
                    id="customReference"
                    {...form.register('customReference')}
                    placeholder="Ex: RB3025-001"
                  />
                </div>
              </>
            )}

            {/* État */}
            {(brandId || useManualEntry) && (
              <div>
                <Label>État *</Label>
                <Select onValueChange={(value) => form.setValue('state', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuf_etiquette">✨ Neuf avec étiquette</SelectItem>
                    <SelectItem value="neuf_sans_etiquette">🌟 Neuf sans étiquette</SelectItem>
                    <SelectItem value="tres_bon">👍 Très bon état</SelectItem>
                    <SelectItem value="bon">👌 Bon état</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.state && (
                  <p className="text-sm text-error mt-1">{form.formState.errors.state.message}</p>
                )}
              </div>
            )}

            {/* Détails produit */}
            {(brandId || useManualEntry) && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="colorFrame">Couleur monture</Label>
                    <Input
                      id="colorFrame"
                      {...form.register('colorFrame')}
                      placeholder="Ex: Noir brillant"
                    />
                  </div>

                  <div>
                    <Label htmlFor="colorLens">Couleur verres</Label>
                    <Input
                      id="colorLens"
                      {...form.register('colorLens')}
                      placeholder="Ex: Vert G-15"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="material">Matériau</Label>
                  <Input
                    id="material"
                    {...form.register('material')}
                    placeholder="Ex: Acétate"
                  />
                </div>

                {/* 3 champs de taille séparés */}
                <div>
                  <Label className="mb-2 block">Dimensions (mm)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sizeLens" className="text-xs text-medium-grey">Verres</Label>
                      <Input
                        id="sizeLens"
                        {...form.register('sizeLens')}
                        placeholder="52"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sizeBridge" className="text-xs text-medium-grey">Pont</Label>
                      <Input
                        id="sizeBridge"
                        {...form.register('sizeBridge')}
                        placeholder="21"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sizeTemple" className="text-xs text-medium-grey">Branches</Label>
                      <Input
                        id="sizeTemple"
                        {...form.register('sizeTemple')}
                        placeholder="140"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Prix */}
            {(brandId || useManualEntry) && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Prix (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register('price', { valueAsNumber: true })}
                      placeholder="0.00"
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
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Décrivez l'état, les détails, les accessoires inclus..."
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-error mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>

                {/* Photos */}
                <div>
                  <Label>Photos * (1 à 5 photos)</Label>
                  <p className="text-sm text-medium-grey mb-2">
                    Ajoutez des photos claires pour augmenter vos chances de vente
                  </p>
                  <FileUpload
                    accept="image/*"
                    multiple
                    onFilesChange={(files) => form.setValue('photos', files)}
                    value={form.watch('photos') || []}
                    error={form.formState.errors.photos?.message}
                  />
                </div>
              </>
            )}

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
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {error || 'Publication...'}
                  </>
                ) : (
                  'Publier l\'annonce'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { OpeningHoursInput } from '@/components/ui/opening-hours-input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2, Lock, Store, User, X } from 'lucide-react'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile'
import {
  uploadFileToCloudinary,
  uploadMultipleFiles,
} from '@/lib/cloudinary/client-upload'
import { updateProfile } from './actions'

interface OpeningHour {
  day: string
  hours: string
}

interface ProfileFormProps {
  profile: {
    civility?: string | null
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    company_name?: string | null
    shop_address?: string | null
    city?: string | null
    postal_code?: string | null
    country?: string | null
    vat_number?: string | null
    opening_hours?: unknown
    profile_photo_url?: string | null
    shop_photos?: unknown
  } | null
  email: string
}

const MAX_SHOP_PHOTOS = 3

function toOpeningHours(value: unknown): OpeningHour[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is OpeningHour =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as OpeningHour).day === 'string' &&
      typeof (item as OpeningHour).hours === 'string'
  )
}

function toPhotoUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Images déjà enregistrées (URLs Cloudinary) vs nouveaux fichiers à uploader.
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(profile?.profile_photo_url ?? '')
  const [newLogo, setNewLogo] = useState<File[]>([])
  const [currentShopPhotos, setCurrentShopPhotos] = useState<string[]>(
    toPhotoUrls(profile?.shop_photos)
  )
  const [newShopPhotos, setNewShopPhotos] = useState<File[]>([])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      civility: (profile?.civility as 'mr' | 'mrs') ?? undefined,
      firstName: profile?.first_name ?? '',
      lastName: profile?.last_name ?? '',
      phone: profile?.phone ?? '',
      companyName: profile?.company_name ?? '',
      shopAddress: profile?.shop_address ?? '',
      city: profile?.city ?? '',
      postalCode: profile?.postal_code ?? '',
      country: (profile?.country as ProfileFormValues['country']) ?? undefined,
      vatNumber: profile?.vat_number ?? '',
      openingHours: toOpeningHours(profile?.opening_hours),
      profilePhotoUrl: profile?.profile_photo_url ?? '',
      shopPhotos: toPhotoUrls(profile?.shop_photos),
    },
  })

  const totalShopPhotos = currentShopPhotos.length + newShopPhotos.length

  const removeCurrentShopPhoto = (index: number) => {
    setCurrentShopPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      if (totalShopPhotos > MAX_SHOP_PHOTOS) {
        throw new Error(`Maximum ${MAX_SHOP_PHOTOS} photos de boutique`)
      }

      // 1. Nouveau logo si l'utilisateur en a déposé un, sinon on garde l'existant.
      let photoUrl = currentPhotoUrl
      if (newLogo[0]) {
        setProgress('Upload de la photo de profil...')
        const uploaded = await uploadFileToCloudinary(newLogo[0], 'opti-troc/profile')
        photoUrl = uploaded.url
      }

      // 2. Photos de boutique conservées + nouvelles.
      let shopPhotoUrls = [...currentShopPhotos]
      if (newShopPhotos.length > 0) {
        setProgress(`Upload des photos (${newShopPhotos.length})...`)
        const uploaded = await uploadMultipleFiles(newShopPhotos, 'opti-troc/shop')
        shopPhotoUrls = [...shopPhotoUrls, ...uploaded.map((r) => r.url)]
      }

      setProgress('Enregistrement...')
      const result = await updateProfile({
        ...data,
        profilePhotoUrl: photoUrl,
        shopPhotos: shopPhotoUrls,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Les nouveaux fichiers sont désormais des URLs enregistrées.
      setCurrentPhotoUrl(photoUrl)
      setCurrentShopPhotos(shopPhotoUrls)
      setNewLogo([])
      setNewShopPhotos([])
      form.reset({ ...data, profilePhotoUrl: photoUrl, shopPhotos: shopPhotoUrls })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setProgress(null)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-fern/30 bg-fern/5">
          <CheckCircle2 className="h-4 w-4 text-fern" />
          <AlertDescription className="text-hunter-green">
            Vos informations ont été enregistrées.
          </AlertDescription>
        </Alert>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Section 1 — Informations du compte                                */}
      {/* ---------------------------------------------------------------- */}
      <Card className="bg-off-white border-light-grey border-t-4 border-t-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pine-teal">
            <User className="w-5 h-5" />
            Informations du compte
          </CardTitle>
          <CardDescription>Vos coordonnées personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="civility">Civilité *</Label>
            <Select
              defaultValue={profile?.civility ?? undefined}
              onValueChange={(value) =>
                form.setValue('civility', value as 'mr' | 'mrs', { shouldDirty: true })
              }
            >
              <SelectTrigger id="civility">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mr">Monsieur</SelectItem>
                <SelectItem value="mrs">Madame</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.civility && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.civility.message}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" {...form.register('firstName')} placeholder="Votre prénom" />
              {form.formState.errors.firstName && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" {...form.register('lastName')} placeholder="Votre nom" />
              {form.formState.errors.lastName && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register('phone')}
              placeholder="+32 2 123 45 67"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-1.5">
              Email
              <Lock className="w-3 h-3 text-medium-grey" />
            </Label>
            <Input id="email" type="email" value={email} readOnly disabled />
            <p className="text-xs text-medium-grey mt-1">
              L&apos;adresse email ne peut pas être modifiée. Contactez le support si
              nécessaire.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Section 2 — Informations de l'établissement                       */}
      {/* ---------------------------------------------------------------- */}
      <Card className="bg-off-white border-light-grey border-t-4 border-t-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pine-teal">
            <Store className="w-5 h-5" />
            Informations de l&apos;établissement
          </CardTitle>
          <CardDescription>Les informations visibles sur vos annonces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Nom de l&apos;entreprise *</Label>
            <Input
              id="companyName"
              {...form.register('companyName')}
              placeholder="Raison sociale de votre établissement"
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="shopAddress">Adresse *</Label>
            <Input
              id="shopAddress"
              {...form.register('shopAddress')}
              placeholder="Numéro et rue"
            />
            {form.formState.errors.shopAddress && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.shopAddress.message}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input id="city" {...form.register('city')} placeholder="Votre ville" />
              {form.formState.errors.city && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input id="postalCode" {...form.register('postalCode')} placeholder="1000" />
              {form.formState.errors.postalCode && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.postalCode.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="country">Pays *</Label>
              <Select
                defaultValue={profile?.country ?? undefined}
                onValueChange={(value) =>
                  form.setValue('country', value as ProfileFormValues['country'], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BE">🇧🇪 Belgique</SelectItem>
                  <SelectItem value="NL">🇳🇱 Pays-Bas</SelectItem>
                  <SelectItem value="LU">🇱🇺 Luxembourg</SelectItem>
                  <SelectItem value="FR">🇫🇷 France</SelectItem>
                  <SelectItem value="CH">🇨🇭 Suisse</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.country && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="vatNumber">Numéro de TVA *</Label>
            <Input
              id="vatNumber"
              {...form.register('vatNumber')}
              placeholder="BE0123456789"
            />
            {form.formState.errors.vatNumber && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.vatNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label>Horaires d&apos;ouverture</Label>
            <p className="text-sm text-medium-grey mb-2">Ajoutez vos horaires jour par jour</p>
            <OpeningHoursInput
              value={form.watch('openingHours') || []}
              onChange={(hours) =>
                form.setValue('openingHours', hours, { shouldDirty: true })
              }
            />
          </div>

          {/* Photo de profil */}
          <div>
            <Label>Photo de profil / logo</Label>
            <p className="text-sm text-medium-grey mb-2">
              Affichée sur votre profil et vos annonces
            </p>

            {currentPhotoUrl && newLogo.length === 0 && (
              <div className="flex items-center gap-3 p-3 mb-3 bg-dust-grey rounded-lg border border-light-grey">
                <div className="relative w-12 h-12 shrink-0">
                  <Image
                    src={currentPhotoUrl}
                    alt="Photo de profil actuelle"
                    fill
                    sizes="48px"
                    className="object-cover rounded"
                  />
                </div>
                <p className="flex-1 text-sm text-dark-grey">Photo actuelle</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPhotoUrl('')}
                  className="h-8 w-8 p-0"
                  aria-label="Supprimer la photo de profil"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <FileUpload
              accept="image/*"
              onFilesChange={setNewLogo}
              value={newLogo}
            />
          </div>

          {/* Photos de la boutique */}
          <div>
            <Label>Photos de la boutique</Label>
            <p className="text-sm text-medium-grey mb-2">
              Jusqu&apos;à {MAX_SHOP_PHOTOS} photos de votre point de vente
              {' — '}
              {totalShopPhotos}/{MAX_SHOP_PHOTOS} utilisées
            </p>

            {currentShopPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {currentShopPhotos.map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-lg overflow-hidden border border-light-grey"
                  >
                    <Image
                      src={url}
                      alt={`Photo de boutique ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 33vw, 200px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeCurrentShopPhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-charcoal/70 hover:bg-charcoal rounded transition-colors"
                      aria-label={`Supprimer la photo ${index + 1}`}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalShopPhotos < MAX_SHOP_PHOTOS && (
              <FileUpload
                accept="image/*"
                multiple
                onFilesChange={setNewShopPhotos}
                value={newShopPhotos}
              />
            )}

            {totalShopPhotos > MAX_SHOP_PHOTOS && (
              <p className="text-sm text-error mt-1">
                Maximum {MAX_SHOP_PHOTOS} photos — supprimez-en avant d&apos;en ajouter.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold hover:bg-gold-hover text-charcoal font-semibold border-0 h-12 px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {progress ?? 'Enregistrement...'}
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Stepper } from '@/components/ui/stepper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { OpeningHoursInput } from '@/components/ui/opening-hours-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  onboardingCompanySchema,
  onboardingShopSchema,
  type OnboardingCompanyForm,
  type OnboardingShopForm,
} from '@/lib/validations/auth'
import { uploadFileToCloudinary, uploadMultipleFiles } from '@/lib/cloudinary/client-upload'
import { completeOnboarding } from './actions'

const steps = [
  { title: 'Entreprise', description: 'Informations légales' },
  { title: 'Boutique', description: 'Votre point de vente' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    step1: {} as OnboardingCompanyForm,
    step2: {} as OnboardingShopForm,
  })

  const step1Form = useForm<OnboardingCompanyForm>({
    resolver: zodResolver(onboardingCompanySchema),
    defaultValues: formData.step1,
  })

  const step2Form = useForm<OnboardingShopForm>({
    resolver: zodResolver(onboardingShopSchema),
    defaultValues: formData.step2,
  })

  const handleNextStep = async (data: any) => {
    setFormData((prev) => ({
      ...prev,
      [`step${currentStep}`]: data,
    }))
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleFinalSubmit = async (data: OnboardingShopForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload document officiel
      setError('Upload du document officiel...')
      const officialDocUrl = await uploadFileToCloudinary(
        formData.step1.officialDocument,
        'opti-troc/pending-validation/documents'
      )

      // 2. Upload logo
      setError('Upload du logo...')
      const logoUrl = await uploadFileToCloudinary(
        data.logo,
        'opti-troc/pending-validation/profile'
      )

      // 3. Upload photos boutique (optionnel)
      let shopPhotosUrls: string[] = []
      if (data.shopPhotos && data.shopPhotos.length > 0) {
        setError(`Upload des photos (${data.shopPhotos.length})...`)
        const uploadResults = await uploadMultipleFiles(
          data.shopPhotos,
          'opti-troc/pending-validation/shop'
        )
        shopPhotosUrls = uploadResults.map(result => result.url)
      }

      // 4. Préparer les données
      setError('Finalisation...')
      const onboardingData = {
        companyName: formData.step1.companyName,
        country: formData.step1.country,
        companyNumber: formData.step1.companyNumber,
        vatNumber: formData.step1.vatNumber,
        phone: formData.step1.phone,
        officialDocumentUrl: officialDocUrl.url,
        shopAddress: data.shopAddress,
        city: data.city,
        postalCode: data.postalCode,
        openingHours: data.openingHours,
        logoUrl: logoUrl.url,
        shopPhotosUrls: shopPhotosUrls,
      }

      // 5. Appeler la Server Action
      const result = await completeOnboarding(onboardingData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // 6. Redirection vers page de succès
      router.push('/onboarding/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dust-grey py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-dark">
            Complétez votre profil
          </h1>
          <p className="text-dark-grey mt-2">
            Dernières étapes avant de pouvoir vendre
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Formulaire */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Étape 1 : Informations entreprise */}
            {currentStep === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleNextStep)} className="space-y-6">
                <div>
                  <Label htmlFor="companyName">Nom de la société *</Label>
                  <Input
                    id="companyName"
                    {...step1Form.register('companyName')}
                    placeholder="Optique Smith"
                  />
                  {step1Form.formState.errors.companyName && (
                    <p className="text-sm text-error mt-1">
                      {step1Form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <Select
                    onValueChange={(value) => step1Form.setValue('country', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BE">🇧🇪 Belgique</SelectItem>
                      <SelectItem value="NL">🇳🇱 Pays-Bas</SelectItem>
                      <SelectItem value="LU">🇱🇺 Luxembourg</SelectItem>
                      <SelectItem value="FR">🇫🇷 France</SelectItem>
                      <SelectItem value="CH">🇨🇭 Suisse</SelectItem>
                    </SelectContent>
                  </Select>
                  {step1Form.formState.errors.country && (
                    <p className="text-sm text-error mt-1">
                      {step1Form.formState.errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyNumber">Numéro d'entreprise *</Label>
                  <Input
                    id="companyNumber"
                    {...step1Form.register('companyNumber')}
                    placeholder="BCE / KVK / RCS..."
                  />
                  {step1Form.formState.errors.companyNumber && (
                    <p className="text-sm text-error mt-1">
                      {step1Form.formState.errors.companyNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vatNumber">Numéro de TVA intracommunautaire *</Label>
                  <Input
                    id="vatNumber"
                    {...step1Form.register('vatNumber')}
                    placeholder="BE0123456789"
                  />
                  {step1Form.formState.errors.vatNumber && (
                    <p className="text-sm text-error mt-1">
                      {step1Form.formState.errors.vatNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...step1Form.register('phone')}
                    placeholder="+32 2 123 45 67"
                  />
                  {step1Form.formState.errors.phone && (
                    <p className="text-sm text-error mt-1">
                      {step1Form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Document officiel (KBIS / BCE / KVK / RCS) *</Label>
                  <FileUpload
                    accept=".pdf,image/*"
                    onFilesChange={(files) => {
                      if (files[0]) {
                        step1Form.setValue('officialDocument', files[0])
                      }
                    }}
                    value={step1Form.watch('officialDocument') ? [step1Form.watch('officialDocument')] : []}
                    error={step1Form.formState.errors.officialDocument?.message}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Étape suivante
                </Button>
              </form>
            )}

            {/* Étape 2 : Informations boutique */}
            {currentStep === 2 && (
              <form onSubmit={step2Form.handleSubmit(handleFinalSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="shopAddress">Adresse de la boutique *</Label>
                  <Input
                    id="shopAddress"
                    {...step2Form.register('shopAddress')}
                    placeholder="Rue de la Loi 16"
                  />
                  {step2Form.formState.errors.shopAddress && (
                    <p className="text-sm text-error mt-1">
                      {step2Form.formState.errors.shopAddress.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      {...step2Form.register('city')}
                      placeholder="Bruxelles"
                    />
                    {step2Form.formState.errors.city && (
                      <p className="text-sm text-error mt-1">
                        {step2Form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Code postal *</Label>
                    <Input
                      id="postalCode"
                      {...step2Form.register('postalCode')}
                      placeholder="1000"
                    />
                    {step2Form.formState.errors.postalCode && (
                      <p className="text-sm text-error mt-1">
                        {step2Form.formState.errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Logo / Photo de profil *</Label>
                  <p className="text-sm text-medium-grey mb-2">
                    Cette image sera affichée sur votre profil et vos annonces
                  </p>
                  <FileUpload
                    accept="image/*"
                    onFilesChange={(files) => {
                      if (files[0]) {
                        step2Form.setValue('logo', files[0])
                      }
                    }}
                    value={step2Form.watch('logo') ? [step2Form.watch('logo')] : []}
                    error={step2Form.formState.errors.logo?.message}
                  />
                </div>

                <div>
                  <Label>Horaires d'ouverture (optionnel)</Label>
                  <p className="text-sm text-medium-grey mb-2">
                    Ajoutez vos horaires jour par jour
                  </p>
                  <OpeningHoursInput
                    value={step2Form.watch('openingHours') || []}
                    onChange={(hours) => step2Form.setValue('openingHours', hours)}
                  />
                </div>

                <div>
                  <Label>Photos de la boutique (optionnel)</Label>
                  <p className="text-sm text-medium-grey mb-2">
                    Jusqu'à 3 photos de votre point de vente
                  </p>
                  <FileUpload
                    accept="image/*"
                    multiple
                    onFilesChange={(files) => {
                      step2Form.setValue('shopPhotos', files)
                    }}
                    value={step2Form.watch('shopPhotos') || []}
                    error={step2Form.formState.errors.shopPhotos?.message}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Retour
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {error || 'Finalisation...'}
                      </>
                    ) : (
                      'Terminer'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
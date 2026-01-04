import { z } from 'zod'

// Schéma d'inscription simple
export const simpleRegistrationSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  civility: z.enum(['mr', 'mrs'], {
    required_error: 'Veuillez sélectionner votre civilité',
  }),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type SimpleRegistrationForm = z.infer<typeof simpleRegistrationSchema>

// Schémas pour l'onboarding (après inscription)

// Étape 1 : Informations entreprise
export const onboardingCompanySchema = z.object({
  companyName: z.string().min(2, 'Le nom de société doit contenir au moins 2 caractères'),
  country: z.enum(['BE', 'NL', 'LU', 'FR', 'CH'], {
    required_error: 'Veuillez sélectionner un pays',
  }),
  companyNumber: z.string().min(5, 'Numéro d\'entreprise invalide'),
  vatNumber: z.string()
    .min(5, 'Numéro de TVA invalide')
    .regex(/^[A-Z]{2}/, 'Le numéro de TVA doit commencer par le code pays (ex: BE, FR)'),
  phone: z.string()
    .min(10, 'Numéro de téléphone invalide')
    .regex(/^[+]?[0-9\s-]+$/, 'Format de téléphone invalide'),
  officialDocument: z.instanceof(File, {
    message: 'Veuillez télécharger le document officiel',
  }).refine((file) => file.size <= 5000000, 'Le fichier doit faire moins de 5MB')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
      'Format accepté : PDF, JPG, PNG'
    ),
})

// Étape 2 : Informations boutique
export const onboardingShopSchema = z.object({
  shopAddress: z.string().min(5, 'Adresse complète requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  openingHours: z.array(z.object({
    day: z.string().min(1, 'Jour requis'),
    hours: z.string().min(1, 'Horaires requis'),
  })).optional(),
  logo: z.instanceof(File, {
    message: 'Veuillez télécharger votre logo',
  }).refine((file) => file.size <= 5000000, 'Le fichier doit faire moins de 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Format accepté : JPG, PNG, WEBP'
    ),
  shopPhotos: z.array(z.instanceof(File))
    .max(3, 'Maximum 3 photos')
    .optional()
    .refine(
      (files) => !files || files.every((file) => file.size <= 5000000),
      'Chaque photo doit faire moins de 5MB'
    )
    .refine(
      (files) => !files || files.every((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)),
      'Format accepté : JPG, PNG, WEBP'
    ),
})

// Schéma de connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export type LoginForm = z.infer<typeof loginSchema>

export type OnboardingCompanyForm = z.infer<typeof onboardingCompanySchema>
export type OnboardingShopForm = z.infer<typeof onboardingShopSchema>
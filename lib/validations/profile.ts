import { z } from 'zod'

/**
 * Édition du profil depuis le dashboard.
 *
 * Reprend les règles de lib/validations/auth.ts (onboarding), mais les images
 * sont ici des URLs Cloudinary déjà uploadées et non des File.
 */
export const profileSchema = z.object({
  // Section 1 — Informations du compte
  civility: z.enum(['mr', 'mrs'], {
    required_error: 'Veuillez sélectionner votre civilité',
  }),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phone: z
    .string()
    .min(10, 'Numéro de téléphone invalide')
    .regex(/^[+]?[0-9\s-]+$/, 'Format de téléphone invalide'),

  // Section 2 — Informations de l'établissement
  companyName: z.string().min(2, 'Le nom de société doit contenir au moins 2 caractères'),
  shopAddress: z.string().min(5, 'Adresse complète requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  country: z.enum(['BE', 'NL', 'LU', 'FR', 'CH'], {
    required_error: 'Veuillez sélectionner un pays',
  }),
  vatNumber: z
    .string()
    .min(5, 'Numéro de TVA invalide')
    .regex(/^[A-Z]{2}/, 'Le numéro de TVA doit commencer par le code pays (ex: BE, FR)'),
  openingHours: z
    .array(
      z.object({
        day: z.string().min(1, 'Jour requis'),
        hours: z.string().min(1, 'Horaires requis'),
      })
    )
    .optional(),
  profilePhotoUrl: z.string().url('URL de photo invalide').or(z.literal('')).optional(),
  shopPhotos: z.array(z.string().url()).max(3, 'Maximum 3 photos').optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

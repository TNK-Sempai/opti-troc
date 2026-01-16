import { z } from 'zod'

// Schéma pour annonce unitaire
export const unitListingSchema = z.object({
  // Cascade catalogue OU saisie manuelle
  gender: z.enum(['homme', 'femme', 'mixte', 'enfant']),
  category: z.enum(['vue', 'solaires', 'sport']),
  
  // Mode catalogue
  brandId: z.string().uuid().optional(),
  modelId: z.string().uuid().optional(),
  referenceId: z.string().uuid().optional(),
  
  // Mode manuel
  customBrand: z.string().min(1).max(100).optional(),
  customModel: z.string().min(1).max(255).optional(),
  customReference: z.string().max(100).optional(),
  
  // Détails produit
  state: z.enum(['neuf_etiquette', 'neuf_sans_etiquette', 'tres_bon', 'bon']),
  colorFrame: z.string().max(100).optional(),
  colorLens: z.string().max(100).optional(),
  material: z.string().max(100).optional(),
  
  // Tailles séparées
  sizeLens: z.string().max(20).optional(),
  sizeBridge: z.string().max(20).optional(),
  sizeTemple: z.string().max(20).optional(),
  
  // Prix et options
  price: z.number().positive().max(999999.99),

  // Contenu
  description: z.string().min(20).max(2000),
  allowHandDelivery: z.boolean(),
  
  // Photos (1 à 5)
  photos: z.array(z.instanceof(File)).min(1).max(5),
})

export type UnitListingForm = z.infer<typeof unitListingSchema>

// Schéma pour annonce lot
export const lotListingSchema = z.object({
  totalPrice: z.number().positive().max(999999.99),
  description: z.string().min(20).max(2000),
  allowPartialSale: z.boolean(),
  
  // Items du lot (min 1)
  items: z.array(
    z.object({
      brand: z.string().min(1).max(100),
      model: z.string().min(1).max(255),
      reference: z.string().max(100).optional(),
      state: z.enum(['neuf_etiquette', 'neuf_sans_etiquette', 'tres_bon', 'bon']),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  
  // Photos (1 à 10 pour lots)
  photos: z.array(z.instanceof(File)).min(1).max(10),
})

export type LotListingForm = z.infer<typeof lotListingSchema>
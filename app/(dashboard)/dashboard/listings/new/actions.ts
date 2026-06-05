'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logError, logInfo } from '@/lib/logger'

export async function createUnitListing(data: {
  brand: string
  model: string
  reference: string
  gender: string
  category: string
  state: string
  colorFrame?: string
  colorLens?: string
  material?: string
  sizeLens?: string
  sizeBridge?: string
  sizeTemple?: string
  price: number
  allowHandDelivery: boolean
  description: string
  photosUrls: { url: string; publicId: string }[]
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est validé ou admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    if (profile?.status !== 'validated' && profile?.role !== 'admin') {
      return { success: false, error: 'Votre compte doit être validé pour créer des annonces' }
    }

    // ========================================
    // ALIMENTER LE CATALOGUE AUTOMATIQUEMENT
    // ========================================

    // 1. Vérifier/créer la marque
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', data.brand) // Insensible à la casse
      .single()

    let brandId: string

    if (!existingBrand) {
      // Créer la nouvelle marque
      const { data: newBrand, error: brandError } = await supabase
        .from('brands')
        .insert({ name: data.brand, is_active: true })
        .select('id')
        .single()

      if (brandError || !newBrand) {
        logError('createUnitListing.brand', brandError)
        return { success: false, error: 'Erreur lors de la création de la marque' }
      }

      brandId = newBrand.id
      logInfo('createUnitListing', 'Nouvelle marque créée:', data.brand)
    } else {
      brandId = existingBrand.id
      logInfo('createUnitListing', 'Marque existante:', data.brand)
    }

    // 2. Vérifier/créer le modèle
    const { data: existingModel } = await supabase
      .from('models')
      .select('id')
      .eq('brand_id', brandId)
      .ilike('name', data.model)
      .eq('gender', data.gender)
      .eq('type', data.category)
      .single()

    let modelId: string

    if (!existingModel) {
      // Créer le nouveau modèle
      const { data: newModel, error: modelError } = await supabase
        .from('models')
        .insert({
          brand_id: brandId,
          name: data.model,
          gender: data.gender,
          type: data.category,
          is_active: true,
        })
        .select('id')
        .single()

      if (modelError || !newModel) {
        logError('createUnitListing.model', modelError)
        return { success: false, error: 'Erreur lors de la création du modèle' }
      }

      modelId = newModel.id
      logInfo('createUnitListing', 'Nouveau modèle créé:', data.model)
    } else {
      modelId = existingModel.id
      logInfo('createUnitListing', 'Modèle existant:', data.model)
    }

    // 3. Vérifier/créer la référence (si fournie ET avec détails)
    if (data.reference && (data.colorFrame || data.colorLens || data.sizeLens)) {
      const { data: existingRef } = await supabase
        .from('product_references')
        .select('id')
        .eq('model_id', modelId)
        .ilike('reference', data.reference)
        .single()

      if (!existingRef) {
        // Créer la nouvelle référence
        const { error: refError } = await supabase
          .from('product_references')
          .insert({
            model_id: modelId,
            reference: data.reference,
            color_frame: data.colorFrame || null,
            color_lens: data.colorLens || null,
            material_frame: data.material || null,
            size_lens: data.sizeLens || null,
            size_bridge: data.sizeBridge || null,
            size_temple: data.sizeTemple || null,
            is_active: true,
          })

        if (!refError) {
          logInfo('createUnitListing', 'Nouvelle référence créée:', data.reference)
        }
      } else {
        logInfo('createUnitListing', 'Référence existante:', data.reference)
      }
    }

    // ========================================
    // CRÉER L'ANNONCE
    // ========================================

    // 1. Créer le listing parent
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        listing_type: 'unit',
        status: 'active',
      })
      .select()
      .single()

    if (listingError) throw listingError

    // 2. Créer l'entrée unit_listings
    const { error: unitError } = await supabase
      .from('unit_listings')
      .insert({
        listing_id: listing.id,
        brand: data.brand,
        model: data.model,
        reference: data.reference || null,
        gender: data.gender,
        category: data.category,
        state: data.state,
        color_frame: data.colorFrame || null,
        color_lens: data.colorLens || null,
        material: data.material || null,
        size_lens: data.sizeLens || null,
        size_bridge: data.sizeBridge || null,
        size_temple: data.sizeTemple || null,
        price: data.price,
        allow_hand_delivery: data.allowHandDelivery,
        description: data.description,
      })

    if (unitError) {
      await supabase.from('listings').delete().eq('id', listing.id)
      throw unitError
    }

    // 3. Insérer les photos
    if (data.photosUrls && data.photosUrls.length > 0) {
      const photosToInsert = data.photosUrls.map((photo, index) => ({
        listing_id: listing.id,
        photo_url: photo.url,
        cloudinary_public_id: photo.publicId,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: photosError } = await supabase
        .from('listing_photos')
        .insert(photosToInsert)

      if (photosError) {
        await supabase.from('listings').delete().eq('id', listing.id)
        throw photosError
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/listings')

    return { success: true }
  } catch (error) {
    logError('createUnitListing', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création',
    }
  }
}

export async function createLotListing(data: {
  totalPrice: number
  allowPartialSale: boolean
  description: string
  items: Array<{
    brand: string
    model: string
    reference?: string
    state: string
    quantity: number
  }>
  photosUrls: { url: string; publicId: string }[]
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est validé ou admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    if (profile?.status !== 'validated' && profile?.role !== 'admin') {
      return { success: false, error: 'Votre compte doit être validé pour créer des annonces' }
    }

    // 1. Créer le listing parent
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        listing_type: 'lot',
        status: 'active',
      })
      .select()
      .single()

    if (listingError) throw listingError

    // 2. Créer l'entrée lot_listings
    const { error: lotError } = await supabase
      .from('lot_listings')
      .insert({
        listing_id: listing.id,
        total_price: data.totalPrice,
        allow_partial_sale: data.allowPartialSale,
        description: data.description,
      })

    if (lotError) {
      await supabase.from('listings').delete().eq('id', listing.id)
      throw lotError
    }

    // 3. Insérer les items du lot
    const itemsToInsert = data.items.map((item, index) => ({
      lot_id: listing.id,
      brand: item.brand,
      model: item.model,
      reference: item.reference || null,
      state: item.state,
      quantity: item.quantity,
      display_order: index,
    }))

    const { error: itemsError } = await supabase
      .from('lot_items')
      .insert(itemsToInsert)

    if (itemsError) {
      await supabase.from('listings').delete().eq('id', listing.id)
      throw itemsError
    }

    // 4. Insérer les photos
    if (data.photosUrls && data.photosUrls.length > 0) {
      const photosToInsert = data.photosUrls.map((photo, index) => ({
        listing_id: listing.id,
        photo_url: photo.url,
        cloudinary_public_id: photo.publicId,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: photosError } = await supabase
        .from('listing_photos')
        .insert(photosToInsert)

      if (photosError) {
        await supabase.from('listings').delete().eq('id', listing.id)
        throw photosError
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/listings')

    return { success: true }
  } catch (error) {
    logError('createLotListing', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création',
    }
  }
}
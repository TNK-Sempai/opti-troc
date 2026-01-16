'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function updateUnitListing(data: {
  listingId: string
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
  existingPhotoIds: string[]
  newPhotosUrls: { url: string; publicId: string }[]
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que c'est bien son annonce
    const { data: listing } = await supabase
      .from('listings')
      .select('id')
      .eq('id', data.listingId)
      .eq('user_id', user.id)
      .single()

    if (!listing) {
      return { success: false, error: 'Annonce non trouvée' }
    }

    // 1. Mettre à jour unit_listings
    const { error: updateError } = await supabase
      .from('unit_listings')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('listing_id', data.listingId)

    if (updateError) throw updateError

    // 2. Gérer les photos
    // Supprimer les photos qui ont été retirées
    const { data: allPhotos } = await supabase
      .from('listing_photos')
      .select('id, cloudinary_public_id')
      .eq('listing_id', data.listingId)

    const photosToDelete = allPhotos?.filter(p => !data.existingPhotoIds.includes(p.id)) || []

    if (photosToDelete.length > 0) {
      // Supprimer de la BDD
      const { error: deleteError } = await supabase
        .from('listing_photos')
        .delete()
        .in('id', photosToDelete.map(p => p.id))

      if (deleteError) throw deleteError

      // TODO: Supprimer de Cloudinary
      // await cloudinary.api.delete_resources(photosToDelete.map(p => p.cloudinary_public_id))
    }

    // Ajouter les nouvelles photos
    if (data.newPhotosUrls.length > 0) {
      const currentMaxOrder = Math.max(
        ...data.existingPhotoIds.map((_, i) => i),
        -1
      )

      const photosToInsert = data.newPhotosUrls.map((photo, index) => ({
        listing_id: data.listingId,
        photo_url: photo.url,
        cloudinary_public_id: photo.publicId,
        is_primary: data.existingPhotoIds.length === 0 && index === 0,
        display_order: currentMaxOrder + index + 1,
      }))

      const { error: photosError } = await supabase
        .from('listing_photos')
        .insert(photosToInsert)

      if (photosError) throw photosError
    }

    // 3. Mettre à jour le timestamp du listing parent
    await supabase
      .from('listings')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.listingId)

    revalidatePath('/dashboard/listings')
    revalidatePath(`/dashboard/listings/${data.listingId}`)

    return { success: true }
  } catch (error) {
    console.error('updateUnitListing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}

export async function updateLotListing(data: {
  listingId: string
  totalPrice: number
  allowPartialSale: boolean
  description: string
  items: Array<{
    id?: string
    brand: string
    model: string
    reference?: string
    state: string
    quantity: number
  }>
  existingPhotoIds: string[]
  newPhotosUrls: { url: string; publicId: string }[]
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que c'est bien son annonce
    const { data: listing } = await supabase
      .from('listings')
      .select('id')
      .eq('id', data.listingId)
      .eq('user_id', user.id)
      .single()

    if (!listing) {
      return { success: false, error: 'Annonce non trouvée' }
    }

    // 1. Mettre à jour lot_listings
    const { error: updateError } = await supabase
      .from('lot_listings')
      .update({
        total_price: data.totalPrice,
        allow_partial_sale: data.allowPartialSale,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('listing_id', data.listingId)

    if (updateError) throw updateError

    // 2. Gérer les items du lot
    // Supprimer tous les anciens items
    await supabase
      .from('lot_items')
      .delete()
      .eq('lot_id', data.listingId)

    // Insérer les nouveaux items
    const itemsToInsert = data.items.map((item, index) => ({
      lot_id: data.listingId,
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

    if (itemsError) throw itemsError

    // 3. Gérer les photos (même logique que unit)
    const { data: allPhotos } = await supabase
      .from('listing_photos')
      .select('id, cloudinary_public_id')
      .eq('listing_id', data.listingId)

    const photosToDelete = allPhotos?.filter(p => !data.existingPhotoIds.includes(p.id)) || []

    if (photosToDelete.length > 0) {
      await supabase
        .from('listing_photos')
        .delete()
        .in('id', photosToDelete.map(p => p.id))
    }

    if (data.newPhotosUrls.length > 0) {
      const currentMaxOrder = Math.max(
        ...data.existingPhotoIds.map((_, i) => i),
        -1
      )

      const photosToInsert = data.newPhotosUrls.map((photo, index) => ({
        listing_id: data.listingId,
        photo_url: photo.url,
        cloudinary_public_id: photo.publicId,
        is_primary: data.existingPhotoIds.length === 0 && index === 0,
        display_order: currentMaxOrder + index + 1,
      }))

      await supabase
        .from('listing_photos')
        .insert(photosToInsert)
    }

    // 4. Mettre à jour le timestamp
    await supabase
      .from('listings')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.listingId)

    revalidatePath('/dashboard/listings')
    revalidatePath(`/dashboard/listings/${data.listingId}`)

    return { success: true }
  } catch (error) {
    console.error('updateLotListing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}
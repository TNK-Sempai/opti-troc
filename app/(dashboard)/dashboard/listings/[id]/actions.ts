'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function deleteListing(formData: FormData) {
  const listingId = formData.get('listingId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Non authentifié')
  }

  try {
    // 1. Récupérer les photos pour les supprimer de Cloudinary
    const { data: photos } = await supabase
      .from('listing_photos')
      .select('cloudinary_public_id')
      .eq('listing_id', listingId)

    // 2. Supprimer le listing (cascade supprime les tables liées)
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    // 3. Supprimer les photos de Cloudinary
    if (photos && photos.length > 0) {
      const publicIds = photos.map(p => p.cloudinary_public_id)
      
      try {
        await cloudinary.api.delete_resources(publicIds)
        console.log('✅ Photos supprimées de Cloudinary:', publicIds.length)
      } catch (cloudinaryError) {
        console.error('⚠️ Erreur suppression Cloudinary:', cloudinaryError)
        // On ne bloque pas si Cloudinary échoue
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/listings')
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error('Erreur lors de la suppression')
  }

  redirect('/dashboard/listings')
}
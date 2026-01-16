import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditUnitListingForm from './edit-unit-form'
import EditLotListingForm from './edit-lot-form'

export const dynamic = 'force-dynamic'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer le listing
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!listing) notFound()

  // Récupérer les photos
  const { data: photos } = await supabase
    .from('listing_photos')
    .select('*')
    .eq('listing_id', id)
    .order('display_order')

  // Récupérer les détails selon le type
  if (listing.listing_type === 'unit') {
    const { data: details } = await supabase
      .from('unit_listings')
      .select('*')
      .eq('listing_id', id)
      .single()

    if (!details) notFound()

    return <EditUnitListingForm listing={listing} details={details} photos={photos || []} />
  } else {
    const { data: details } = await supabase
      .from('lot_listings')
      .select('*')
      .eq('listing_id', id)
      .single()

    const { data: items } = await supabase
      .from('lot_items')
      .select('*')
      .eq('lot_id', id)
      .order('display_order')

    if (!details) notFound()

    return <EditLotListingForm listing={listing} details={details} items={items || []} photos={photos || []} />
  }
}
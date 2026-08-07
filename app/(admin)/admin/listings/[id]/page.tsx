import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye, Package, Building2, User, Ban } from 'lucide-react'
import { ListingActions } from '@/components/admin/listing-actions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select(`
      *,
      unit_listings(*),
      lot_listings(*),
      listing_photos(*),
      user_profiles(company_name, first_name, last_name, city)
    `)
    .eq('id', id)
    .single()

  if (!listing) notFound()

  const isUnit = listing.listing_type === 'unit'
  const details = isUnit ? listing.unit_listings : listing.lot_listings
  const photos = listing.listing_photos || []
  const primaryPhoto = photos.find((p: any) => p.is_primary)
  const seller = listing.user_profiles
  // eslint-disable-next-line react-hooks/purity
  const daysOnline = Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/listings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
            </h1>
            <p className="text-sm text-muted-foreground">Gestion admin</p>
          </div>
        </div>
        <Badge className={listing.status === 'active' ? 'bg-fern' : 'bg-gold'}>
          {listing.status === 'active' ? 'Active' : 'En pause'}
        </Badge>
      </div>

      <Card className="mb-6 border-gold/30 bg-gold/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Actions administrateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/listing/${listing.id}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Vue publique
              </Link>
            </Button>
            <ListingActions listingId={listing.id} currentStatus={listing.status} />
            </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'annonce</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-64 bg-dust-grey rounded-lg overflow-hidden">
                  {primaryPhoto ? (
                    <Image
                      src={primaryPhoto.photo_url}
                      alt="Photo"
                      fill
                      className="object-contain p-4"
                      sizes="60vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-12 h-12 text-dry-sage" />
                    </div>
                  )}
                </div>

                {isUnit && details ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Marque & Modèle</p>
                      <p className="font-semibold text-lg">{details.brand} {details.model}</p>
                    </div>
                    {details.reference && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Référence</p>
                        <p className="font-mono text-sm">{details.reference}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Prix</p>
                        <p className="text-xl font-bold text-primary">{parseFloat(details.price).toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">État</p>
                        <Badge variant="outline">{details.state}</Badge>
                      </div>
                    </div>
                  </div>
                ) : details ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{details.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Prix total</p>
                      <p className="text-xl font-bold text-gold">{parseFloat(details.total_price).toFixed(2)}€</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Vues</span>
                <span className="font-bold">{listing.views_count || 0}</span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">En ligne</span>
                <span className="font-bold">
                  {daysOnline}j
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Vendeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entreprise</p>
                <p className="font-semibold">{seller?.company_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                <p className="text-sm">{seller?.first_name} {seller?.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ville</p>
                <p className="text-sm">{seller?.city}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/admin/users/${listing.user_id}`}>
                  <User className="w-4 h-4 mr-2" />
                  Voir profil
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, Package, Eye, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Récupérer les statistiques des annonces
  const { count: activeListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('status', 'active')

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  // Récupérer les dernières annonces
  const { data: recentListings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Enrichir les annonces avec leurs détails
  interface EnrichedListing {
    id: string
    listing_type: string
    details?: {
      brand?: string
      model?: string
      reference?: string
      price?: number
      quantity?: number
      total_price?: number
    }
  }

  let enrichedListings: EnrichedListing[] = []
  if (recentListings && recentListings.length > 0) {
    const unitIds = recentListings.filter(l => l.listing_type === 'unit').map(l => l.id)
    const lotIds = recentListings.filter(l => l.listing_type === 'lot').map(l => l.id)

    // Récupérer les détails
    const { data: unitListings } = await supabase
      .from('unit_listings')
      .select('*')
      .in('listing_id', unitIds.length > 0 ? unitIds : ['00000000-0000-0000-0000-000000000000'])

    const { data: lotListings } = await supabase
      .from('lot_listings')
      .select('*')
      .in('listing_id', lotIds.length > 0 ? lotIds : ['00000000-0000-0000-0000-000000000000'])

    // Combiner les données
    enrichedListings = recentListings.map(listing => {
      if (listing.listing_type === 'unit') {
        const details = unitListings?.find(u => u.listing_id === listing.id)
        return { ...listing, details }
      } else {
        const details = lotListings?.find(l => l.listing_id === listing.id)
        return { ...listing, details }
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark mb-2">
          Bienvenue, {profile?.first_name} !
        </h1>
        <p className="text-neutral-600">
          {profile?.company_name} - {profile?.city}
        </p>
      </div>

      {/* Action rapide */}
      <div className="mb-8">
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/listings/new">
            <PlusCircle className="w-5 h-5" />
            Créer une nouvelle annonce
          </Link>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Annonces actives</CardDescription>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">{activeListings || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total annonces</CardDescription>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">{totalListings || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Vues totales</CardDescription>
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Dernières annonces */}
      <Card>
        <CardHeader>
          <CardTitle>Mes dernières annonces</CardTitle>
          <CardDescription>
            {totalListings === 0 
              ? "Vous n'avez pas encore créé d'annonce"
              : `${totalListings} annonce(s) au total`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recentListings || recentListings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500 mb-4">Aucune annonce pour le moment</p>
              <Button asChild>
                <Link href="/dashboard/listings/new">
                  Créer ma première annonce
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrichedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex-1">
                    {listing.listing_type === 'unit' && listing.details ? (
                      <>
                        <h3 className="font-medium">
                          {listing.details.brand} {listing.details.model}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {listing.details.reference && `Réf. ${listing.details.reference} • `}
                          {listing.details.price !== undefined && listing.details.price !== null
                            ? `${Number(listing.details.price).toFixed(2)}€`
                            : 'Prix non défini'}
                        </p>
                      </>
                    ) : listing.listing_type === 'lot' && listing.details ? (
                      <>
                        <h3 className="font-medium">Lot de lunettes</h3>
                        <p className="text-sm text-neutral-600">
                          {listing.details.quantity} pièces • {listing.details.total_price !== undefined && listing.details.total_price !== null
                            ? `${Number(listing.details.total_price).toFixed(2)}€`
                            : 'Prix non défini'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium">Annonce</h3>
                        <p className="text-sm text-neutral-600">Détails non disponibles</p>
                      </>
                    )}
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/listings/${listing.id}`}>
                      Voir
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
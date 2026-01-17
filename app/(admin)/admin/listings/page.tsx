import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Layers, Eye, Search, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SearchParams {
  search?: string
  type?: string
  page?: string
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const page = parseInt(params.page || '1')
  const pageSize = 24
  const offset = (page - 1) * pageSize

  let query = supabaseAdmin
    .from('listings')
    .select(`
      *,
      unit_listings(*),
      lot_listings(*),
      listing_photos(*),
      user_profiles(company_name, city)
    `, { count: 'exact' })

  if (params.type && params.type !== 'all') {
    query = query.eq('listing_type', params.type)
  }

  const { data: allListings, count } = await query.order('created_at', { ascending: false })

  if (!allListings) {
    return <div className="container mx-auto px-4 py-8">Erreur de chargement</div>
  }

  let enrichedListings = allListings.map(listing => {
    // IMPORTANT: unit_listings et lot_listings sont des TABLEAUX
    const details = listing.listing_type === 'unit'
      ? (Array.isArray(listing.unit_listings) ? listing.unit_listings[0] : listing.unit_listings)
      : (Array.isArray(listing.lot_listings) ? listing.lot_listings[0] : listing.lot_listings)
    const photo = listing.listing_photos?.find((p: any) => p.is_primary) || listing.listing_photos?.[0]
    const seller = listing.user_profiles
    return { ...listing, details, photo, seller }
  })

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    enrichedListings = enrichedListings.filter(listing => {
      if (listing.listing_type === 'unit' && listing.details) {
        return (
          listing.details.brand?.toLowerCase().includes(searchLower) ||
          listing.details.model?.toLowerCase().includes(searchLower) ||
          listing.details.reference?.toLowerCase().includes(searchLower) ||
          listing.seller?.company_name?.toLowerCase().includes(searchLower)
        )
      } else if (listing.listing_type === 'lot' && listing.details) {
        return (
          listing.details.description?.toLowerCase().includes(searchLower) ||
          listing.seller?.company_name?.toLowerCase().includes(searchLower)
        )
      }
      return false
    })
  }

  const totalResults = enrichedListings.length
  const paginatedListings = enrichedListings.slice(offset, offset + pageSize)
  const totalPages = Math.ceil(totalResults / pageSize)

  const stats = {
    total: allListings.length,
    active: allListings.filter(l => l.status === 'active').length,
    unit: allListings.filter(l => l.listing_type === 'unit').length,
    lot: allListings.filter(l => l.listing_type === 'lot').length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Toutes les annonces</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de la marketplace</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.unit}</p>
            <p className="text-xs text-muted-foreground">Unitaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">{stats.lot}</p>
            <p className="text-xs text-muted-foreground">Lots</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form method="GET" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Rechercher..."
                  defaultValue={params.search}
                  className="pl-10"
                />
              </form>
            </div>
            <div className="flex gap-2">
              <Button asChild variant={!params.type || params.type === 'all' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/listings?type=all">Tous</Link>
              </Button>
              <Button asChild variant={params.type === 'unit' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/listings?type=unit">Unitaires</Link>
              </Button>
              <Button asChild variant={params.type === 'lot' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/listings?type=lot">Lots</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {paginatedListings.map((listing) => {
          const isUnit = listing.listing_type === 'unit'
          const details = listing.details

          return (
            <Card key={listing.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-40 bg-gradient-to-br from-neutral-100 to-neutral-50">
                {listing.photo ? (
                  <Image
                    src={listing.photo.photo_url}
                    alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isUnit ? <Package className="w-10 h-10 text-neutral-300" /> : <Layers className="w-10 h-10 text-neutral-300" />}
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <Badge className={`${isUnit ? 'bg-primary' : 'bg-green-600'} text-white text-xs`}>
                    {isUnit ? 'Unit' : 'Lot'}
                  </Badge>
                </div>

                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {listing.views_count || 0}
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{listing.seller?.company_name}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-3">
                {isUnit && details ? (
                  <>
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                      {details.brand} {details.model}
                    </h3>
                    {details.reference && (
                      <p className="text-xs font-mono text-muted-foreground mb-2 line-clamp-1">
                        {details.reference}
                      </p>
                    )}
                    <p className="text-lg font-bold text-primary">
                      {parseFloat(details.price).toFixed(0)}€
                    </p>
                  </>
                ) : details ? (
                  <>
                    <h3 className="font-semibold text-sm mb-1">Lot</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {details.description}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {parseFloat(details.total_price).toFixed(0)}€
                    </p>
                  </>
                ) : null}

                <Button asChild size="sm" className="w-full h-8 text-xs mt-3">
                  <Link href={`/admin/listings/${listing.id}`}>Gérer</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {offset + 1}-{Math.min(offset + pageSize, totalResults)} sur {totalResults}
              </p>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/listings?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}>
                      ← Préc.
                    </Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/listings?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}>
                      Suiv. →
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
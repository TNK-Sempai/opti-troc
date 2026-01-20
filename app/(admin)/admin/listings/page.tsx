import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PremiumButton } from '@/components/ui/premium-button'
import { StatCard } from '@/components/ui/stat-card'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Layers, Eye, Search, Building2, CheckCircle, ShoppingBag } from 'lucide-react'

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
      seller:user_profiles!listings_user_id_fkey(company_name, city)
    `, { count: 'exact' })

  if (params.type && params.type !== 'all') {
    query = query.eq('listing_type', params.type)
  }

  const { data: allListings, count, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
  }

  // Debug: log les résultats
  console.log('[Admin Listings] Query result:', {
    dataLength: allListings?.length ?? 'null',
    count,
    error: error?.message || null
  })

  // Utiliser un tableau vide si pas de données
  const listings = allListings || []

  let enrichedListings = listings.map(listing => {
    // IMPORTANT: unit_listings et lot_listings sont des TABLEAUX
    const details = listing.listing_type === 'unit'
      ? (Array.isArray(listing.unit_listings) ? listing.unit_listings[0] : listing.unit_listings)
      : (Array.isArray(listing.lot_listings) ? listing.lot_listings[0] : listing.lot_listings)
    const photo = listing.listing_photos?.find((p: any) => p.is_primary) || listing.listing_photos?.[0]
    // seller est déjà aliasé dans la requête
    return { ...listing, details, photo }
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
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    unit: listings.filter(l => l.listing_type === 'unit').length,
    lot: listings.filter(l => l.listing_type === 'lot').length,
  }

  const currentType = params.type || 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/20 to-blue-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
              <Package className="w-10 h-10 text-purple-600" />
              Toutes les annonces
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Vue d'ensemble de la marketplace</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package} label="Total" value={stats.total} gradient="primary" />
          <StatCard icon={CheckCircle} label="Actives" value={stats.active} gradient="success" />
          <StatCard icon={ShoppingBag} label="Unitaires" value={stats.unit} gradient="purple" />
          <StatCard icon={Layers} label="Lots" value={stats.lot} gradient="secondary" />
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <form method="GET" className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-purple-600 transition-colors" />
              <Input
                name="search"
                placeholder="Rechercher par marque, modèle, vendeur..."
                defaultValue={params.search}
                className="pl-11 h-12 shadow-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium"
              />
            </form>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/listings?type=all"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentType === 'all'
                  ? 'bg-gradient-to-r from-neutral-700 to-neutral-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-neutral-200 hover:border-neutral-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Tous</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentType === 'all' ? 'bg-white/20 text-white border-0' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {stats.total}
              </Badge>
            </Link>

            <Link
              href="/admin/listings?type=unit"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentType === 'unit'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Unitaires</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentType === 'unit' ? 'bg-white/20 text-white border-0' : 'bg-blue-100 text-blue-700'
              }`}>
                {stats.unit}
              </Badge>
            </Link>

            <Link
              href="/admin/listings?type=lot"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentType === 'lot'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lots</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentType === 'lot' ? 'bg-white/20 text-white border-0' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {stats.lot}
              </Badge>
            </Link>
          </div>
        </div>

        {/* Grille des annonces */}
        {paginatedListings.length === 0 ? (
          <Card className="shadow-xl border-purple-200/60 backdrop-blur-sm bg-white/95">
            <CardContent className="text-center py-24 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-neutral-50 opacity-50 rounded-xl" />
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center shadow-lg">
                  <Package className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-neutral-700 font-bold mb-2 text-xl">Aucune annonce</p>
                <p className="text-base text-muted-foreground font-medium">
                  {params.search || params.type !== 'all'
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Aucune annonce sur la plateforme'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
            {paginatedListings.map((listing) => {
              const isUnit = listing.listing_type === 'unit'
              const details = listing.details

              return (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="block group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-neutral-200 hover:border-purple-400 h-full">
                    <div className="relative h-44 bg-gradient-to-br from-neutral-100 to-neutral-50">
                      {listing.photo ? (
                        <Image
                          src={listing.photo.photo_url}
                          alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isUnit ? <Package className="w-12 h-12 text-neutral-300" /> : <Layers className="w-12 h-12 text-neutral-300" />}
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <Badge className={`${isUnit ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-700'} text-white text-xs border-0 shadow-lg font-bold`}>
                          {isUnit ? 'Unitaire' : 'Lot'}
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                        <Eye className="w-3.5 h-3.5" />
                        {listing.views_count || 0}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{listing.seller?.company_name || 'Vendeur'}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      {isUnit && details ? (
                        <>
                          <h3 className="font-bold text-base line-clamp-1 mb-1.5 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                            {details.brand} {details.model}
                          </h3>
                          {details.reference && (
                            <p className="text-xs font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded-lg inline-block mb-3 font-semibold">
                              {details.reference}
                            </p>
                          )}
                          <p className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            {parseFloat(details.price).toFixed(0)}€
                          </p>
                        </>
                      ) : details ? (
                        <>
                          <h3 className="font-bold text-base mb-1.5 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Lot de lunettes</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 font-medium">
                            {details.description}
                          </p>
                          <p className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                            {parseFloat(details.total_price).toFixed(0)}€
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground font-medium">Détails non disponibles</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="shadow-xl border-purple-200/60 backdrop-blur-sm bg-white/95">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-semibold">
                  {offset + 1}-{Math.min(offset + pageSize, totalResults)} sur {totalResults} annonces
                </p>
                <div className="flex items-center gap-3">
                  {page > 1 && (
                    <PremiumButton asChild variant="outline" size="sm" className="border-2">
                      <Link href={`/admin/listings?${new URLSearchParams({ ...params, page: String(page - 1) } as Record<string, string>).toString()}`}>
                        <span>← Précédent</span>
                      </Link>
                    </PremiumButton>
                  )}
                  <span className="text-sm font-bold bg-purple-100 text-purple-700 px-4 py-2 rounded-lg">
                    Page {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <PremiumButton asChild gradient="primary" size="sm">
                      <Link href={`/admin/listings?${new URLSearchParams({ ...params, page: String(page + 1) } as Record<string, string>).toString()}`}>
                        <span>Suivant →</span>
                      </Link>
                    </PremiumButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
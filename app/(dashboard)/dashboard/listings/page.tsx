import { createClient } from '@/lib/supabase/server'
import { validateListingStatus, validateListingType } from '@/lib/validations/query-params'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumButton } from '@/components/ui/premium-button'
import { StatCard } from '@/components/ui/stat-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Package, Eye, Grid3x3, List, Search, Filter, CheckCircle, Pause, ShoppingBag, Layers, ChevronLeft, ChevronRight, Lock, CreditCard } from 'lucide-react'
import ListingsGrid from './listings-grid'
import ListingsList from './listings-list'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate'

export const dynamic = 'force-dynamic'

interface SearchParams {
  search?: string
  status?: string
  type?: string
  view?: 'grid' | 'list'
  page?: string
  pageSize?: string
}

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Non authentifié</div>
  }

  // Vérifier le statut d'abonnement (admins exemptés)
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const subscriptionActive = isAdmin || profile?.subscription_status === 'active'

  // Construire la requête avec filtres
  let query = supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)

  // Filtre par statut
  const validStatus = validateListingStatus(params.status);
  if (validStatus) {
    query = query.eq('status', validStatus)
  }

  // Filtre par type
  const validType = validateListingType(params.type);
  if (validType) {
    query = query.eq('listing_type', validType)
  }

  const { data: listings } = await query.order('created_at', { ascending: false })

  if (!listings) {
    return <div>Erreur de chargement</div>
  }

  // Séparer les IDs par type
  const unitIds = listings.filter(l => l.listing_type === 'unit').map(l => l.id)
  const lotIds = listings.filter(l => l.listing_type === 'lot').map(l => l.id)

  // Récupérer les détails
  const { data: unitListings } = await supabase
    .from('unit_listings')
    .select('*')
    .in('listing_id', unitIds.length > 0 ? unitIds : ['00000000-0000-0000-0000-000000000000'])

  const { data: lotListings } = await supabase
    .from('lot_listings')
    .select('*')
    .in('listing_id', lotIds.length > 0 ? lotIds : ['00000000-0000-0000-0000-000000000000'])

  const { data: photos } = await supabase
    .from('listing_photos')
    .select('*')
    .in('listing_id', listings.map(l => l.id))
    .eq('is_primary', true)

  // Combiner les données
  const photosByListingId = new Map(photos?.map(p => [p.listing_id, p]) ?? [])
  const unitListingsByListingId = new Map(unitListings?.map(u => [u.listing_id, u]) ?? [])
  const lotListingsByListingId = new Map(lotListings?.map(l => [l.listing_id, l]) ?? [])

  let enrichedListings = listings.map(listing => {
    const photo = photosByListingId.get(listing.id)

    if (listing.listing_type === 'unit') {
      const details = unitListingsByListingId.get(listing.id)
      return { ...listing, details, photo }
    } else {
      const details = lotListingsByListingId.get(listing.id)
      return { ...listing, details, photo }
    }
  })

  // Filtre par recherche (côté serveur)
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    enrichedListings = enrichedListings.filter(listing => {
      if (listing.listing_type === 'unit' && listing.details) {
        return (
          listing.details.brand?.toLowerCase().includes(searchLower) ||
          listing.details.model?.toLowerCase().includes(searchLower) ||
          listing.details.reference?.toLowerCase().includes(searchLower)
        )
      } else if (listing.listing_type === 'lot' && listing.details) {
        return listing.details.description?.toLowerCase().includes(searchLower)
      }
      return false
    })
  }

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    sold: listings.filter(l => l.status === 'sold').length,
    paused: listings.filter(l => l.status === 'paused').length,
  }

  // Pagination
  const pageSize = Math.min(parseInt(params.pageSize || '25') || 25, 100)
  const totalResults = enrichedListings.length
  const totalPages = Math.ceil(totalResults / pageSize)
  const page = Math.max(1, Math.min(parseInt(params.page || '1') || 1, totalPages || 1))
  const offset = (page - 1) * pageSize
  const paginatedListings = enrichedListings.slice(offset, offset + pageSize)

  const viewMode = params.view || 'grid'

  function buildUrl(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (params.search) base.search = params.search
    if (params.status) base.status = params.status
    if (params.type) base.type = params.type
    if (params.view) base.view = params.view
    base.pageSize = String(pageSize)
    return `/dashboard/listings?${new URLSearchParams({ ...base, ...overrides }).toString()}`
  }

  return (
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Subscription inactive banner */}
        {!subscriptionActive && (
          <div className="mb-6 flex items-center flex-wrap gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-amber-800">Abonnement inactif</p>
              <p className="text-sm text-amber-700">Renouvelez votre abonnement pour créer de nouvelles annonces.</p>
            </div>
            <Button asChild size="sm" className="bg-pine-teal hover:bg-hunter-green text-white border-0 shrink-0">
              <Link href="/inscription/plans">
                <CreditCard className="w-4 h-4 mr-1.5" />
                Renouveler
              </Link>
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              <span className="text-forest-gradient drop-shadow-sm flex items-center gap-3">
                <Package className="w-10 h-10 text-pine-teal" />
                Mes annonces
              </span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {stats.active} active{stats.active > 1 ? 's' : ''} sur {stats.total} au total
            </p>
          </div>
          {subscriptionActive ? (
            <PremiumButton asChild size="lg" gradient="secondary" glow className="text-base h-14 px-8 shadow-xl">
              <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>Nouvelle annonce</span>
              </Link>
            </PremiumButton>
          ) : (
            <Button disabled size="lg" className="text-base h-14 px-8 opacity-40 cursor-not-allowed">
              <Lock className="w-5 h-5 mr-2" />
              <span>Nouvelle annonce</span>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="w-5 h-5" />} label="Total" value={stats.total} gradient="primary" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Actives" value={stats.active} gradient="success" />
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Vendues" value={stats.sold} gradient="purple" />
          <StatCard icon={<Pause className="w-5 h-5" />} label="En pause" value={stats.paused} gradient="secondary" />
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="mb-8 shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white">
          <CardContent className="p-6">
            <form method="GET" className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-pine-teal transition-colors" />
                <Input
                  name="search"
                  placeholder="Rechercher par marque, modèle, référence..."
                  defaultValue={params.search}
                  className="pl-11 h-12 shadow-sm border-2 border-dry-sage focus:border-fern focus:ring-2 focus:ring-fern/20 font-medium"
                />
              </div>

              {/* Filtre Statut */}
              <Select name="status" defaultValue={params.status || 'all'}>
                <SelectTrigger className="w-full md:w-44 h-12 border-2 border-dry-sage focus:border-fern font-medium">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtre Type */}
              <Select name="type" defaultValue={params.type || 'all'}>
                <SelectTrigger className="w-full md:w-44 h-12 border-2 border-dry-sage focus:border-fern font-medium">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="unit">Unitaire</SelectItem>
                  <SelectItem value="lot">Lot</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle Vue */}
              <div className="flex gap-1 border-2 border-dry-sage rounded-xl p-1.5 bg-white">
                <Link
                  href={`/dashboard/listings?${new URLSearchParams({ ...params, view: 'grid' } as Record<string, string>).toString()}`}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-pine-teal to-hunter-green text-white shadow-lg'
                      : 'hover:bg-pine-teal/5 text-muted-foreground'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </Link>
                <Link
                  href={`/dashboard/listings?${new URLSearchParams({ ...params, view: 'list' } as Record<string, string>).toString()}`}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-pine-teal to-hunter-green text-white shadow-lg'
                      : 'hover:bg-pine-teal/5 text-muted-foreground'
                  }`}
                >
                  <List className="w-5 h-5" />
                </Link>
              </div>

              {/* Bouton recherche */}
              <PremiumButton type="submit" gradient="primary" className="h-12">
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrer
                </span>
              </PremiumButton>
            </form>
          </CardContent>
        </Card>

        {/* Liste des annonces */}
        {paginatedListings.length === 0 ? (
          <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white">
            <CardContent className="text-center py-24 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pine-teal/5 to-dust-grey opacity-50 rounded-xl" />
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pine-teal/20 to-fern/20 rounded-3xl flex items-center justify-center shadow-lg">
                  <Package className="w-12 h-12 text-pine-teal" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">
                  {params.search || params.status || params.type ? 'Aucun résultat' : 'Aucune annonce'}
                </h3>
                <p className="text-muted-foreground mb-8 text-lg font-medium">
                  {params.search || params.status || params.type
                    ? 'Essayez de modifier vos filtres'
                    : 'Créez votre première annonce pour commencer'}
                </p>
                {!params.search && !params.status && !params.type && (
                  <PremiumButton asChild gradient="primary" glow size="lg" className="shadow-xl">
                    <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      <span>Créer une annonce</span>
                    </Link>
                  </PremiumButton>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ListingsGrid listings={paginatedListings} />
            ) : (
              <ListingsList listings={paginatedListings} />
            )}

            {/* Pagination */}
            {totalResults > 0 && (
              <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white mt-6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* PageSize selector */}
                    <div className="flex items-center gap-2">
                      {[25, 50, 100].map(size => (
                        <Button
                          key={size}
                          asChild
                          variant={pageSize === size ? 'default' : 'outline'}
                          size="sm"
                          className={pageSize === size
                            ? 'bg-pine-teal text-white hover:bg-hunter-green font-bold'
                            : 'border-dry-sage hover:border-fern hover:text-pine-teal font-semibold'}
                        >
                          <Link href={buildUrl({ pageSize: String(size), page: '1' })}>{size}</Link>
                        </Button>
                      ))}
                      <span className="text-sm text-muted-foreground font-medium ml-1">par page</span>
                    </div>

                    {/* Range info */}
                    <p className="text-sm font-semibold text-muted-foreground">
                      <span className="text-charcoal">{offset + 1}-{Math.min(offset + pageSize, totalResults)}</span> sur{' '}
                      <span className="text-charcoal">{totalResults}</span>
                    </p>

                    {/* Page navigation */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        {page > 1 && (
                          <Button asChild variant="outline" size="sm" className="border-dry-sage hover:border-fern hover:text-pine-teal font-semibold">
                            <Link href={buildUrl({ page: String(page - 1) })}>
                              <ChevronLeft className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum = i + 1
                          if (totalPages > 5 && page > 3) {
                            pageNum = page - 2 + i
                            if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                          }
                          return (
                            <Button
                              key={pageNum}
                              asChild
                              variant={pageNum === page ? 'default' : 'ghost'}
                              size="sm"
                              className={pageNum === page
                                ? 'w-9 bg-pine-teal text-white hover:bg-hunter-green font-bold'
                                : 'w-9 hover:bg-dust-grey hover:text-pine-teal font-semibold'}
                            >
                              <Link href={buildUrl({ page: String(pageNum) })}>{pageNum}</Link>
                            </Button>
                          )
                        })}
                        {page < totalPages && (
                          <Button asChild variant="outline" size="sm" className="border-dry-sage hover:border-fern hover:text-pine-teal font-semibold">
                            <Link href={buildUrl({ page: String(page + 1) })}>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

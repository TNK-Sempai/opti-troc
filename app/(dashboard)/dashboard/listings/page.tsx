import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumButton } from '@/components/ui/premium-button'
import { StatCard } from '@/components/ui/stat-card'
import Link from 'next/link'
import { PlusCircle, Package, Eye, Grid3x3, List, Search, Filter, CheckCircle, Pause, ShoppingBag, Layers } from 'lucide-react'
import ListingsGrid from './listings-grid'
import ListingsList from './listings-list'

export const dynamic = 'force-dynamic'

interface SearchParams {
  search?: string
  status?: string
  type?: string
  view?: 'grid' | 'list'
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

  // Construire la requête avec filtres
  let query = supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)

  // Filtre par statut
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  // Filtre par type
  if (params.type && params.type !== 'all') {
    query = query.eq('listing_type', params.type)
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
  let enrichedListings = listings.map(listing => {
    const photo = photos?.find(p => p.listing_id === listing.id)

    if (listing.listing_type === 'unit') {
      const details = unitListings?.find(u => u.listing_id === listing.id)
      return { ...listing, details, photo }
    } else {
      const details = lotListings?.find(l => l.listing_id === listing.id)
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
  const viewMode = params.view || 'grid'

  return (
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 relative">
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
          <PremiumButton asChild size="lg" gradient="secondary" glow className="text-base h-14 px-8 shadow-xl">
            <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span>Nouvelle annonce</span>
            </Link>
          </PremiumButton>
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
        {enrichedListings.length === 0 ? (
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
        ) : viewMode === 'grid' ? (
          <ListingsGrid listings={enrichedListings} />
        ) : (
          <ListingsList listings={enrichedListings} />
        )}
      </div>
    </div>
  )
}

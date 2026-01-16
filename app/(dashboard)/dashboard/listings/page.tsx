import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, Package, Eye, Calendar, Grid3x3, List, Search, Filter } from 'lucide-react'
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

  const activeCount = listings.filter(l => l.status === 'active').length
  const totalCount = listings.length
  const viewMode = params.view || 'grid'

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">Mes annonces</h1>
            <p className="text-sm text-neutral-600 mt-1">
              {activeCount} active(s) • {totalCount} au total
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/listings/new">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nouvelle annonce
            </Link>
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="border-neutral-200">
          <CardContent className="p-4">
            <form method="GET" className="flex flex-col md:flex-row gap-3">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  name="search"
                  placeholder="Rechercher par marque, modèle, référence..."
                  defaultValue={params.search}
                  className="pl-10"
                />
              </div>

              {/* Filtre Statut */}
              <Select name="status" defaultValue={params.status || 'all'}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                  <SelectItem value="paused">Pausé</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtre Type */}
              <Select name="type" defaultValue={params.type || 'all'}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="unit">Unitaire</SelectItem>
                  <SelectItem value="lot">Lot</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle Vue */}
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  asChild
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="px-3"
                >
                  <Link href={`/dashboard/listings?${new URLSearchParams({ ...params, view: 'grid' }).toString()}`}>
                    <Grid3x3 className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="px-3"
                >
                  <Link href={`/dashboard/listings?${new URLSearchParams({ ...params, view: 'list' }).toString()}`}>
                    <List className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {/* Bouton recherche */}
              <Button type="submit" className="md:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Liste des annonces */}
      {enrichedListings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-semibold mb-2">
              {params.search || params.status || params.type ? 'Aucun résultat' : 'Aucune annonce'}
            </h3>
            <p className="text-neutral-500 mb-6">
              {params.search || params.status || params.type
                ? 'Essayez de modifier vos filtres'
                : 'Créez votre première annonce pour commencer'}
            </p>
            {!params.search && !params.status && !params.type && (
              <Button asChild>
                <Link href="/dashboard/listings/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Créer une annonce
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <ListingsGrid listings={enrichedListings} />
      ) : (
        <ListingsList listings={enrichedListings} />
      )}
    </div>
  )
}
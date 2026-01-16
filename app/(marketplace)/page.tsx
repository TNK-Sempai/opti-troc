import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Clock, Package, Layers, Eye, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const supabase = await createClient()

  // Récupérer les annonces pour les différentes sections
  const { data: allListings } = await supabase
    .from('listings')
    .select(`
      *,
      unit_listings(*),
      lot_listings(*),
      listing_photos(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!allListings) return <div>Erreur de chargement</div>

  // Enrichir les données
  const enrichedListings = allListings.map(listing => {
    const details = listing.listing_type === 'unit' 
      ? listing.unit_listings?.[0] 
      : listing.lot_listings?.[0]
    const photo = listing.listing_photos?.find((p: any) => p.is_primary)
    return { ...listing, details, photo }
  })

  // Sections
  const mostViewed = enrichedListings
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 4)

  const recent = enrichedListings.slice(0, 4)

  const units = enrichedListings
    .filter(l => l.listing_type === 'unit')
    .slice(0, 4)

  const lots = enrichedListings
    .filter(l => l.listing_type === 'lot')
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-neutral-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary text-white py-16 overflow-hidden">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm font-medium">Marketplace B2B pour professionnels de l'optique</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Vendez et achetez<br />
            votre stock optique
          </h1>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            La plateforme de confiance pour les opticiens. Déstockage, ventes unitaires et lots professionnels.
          </p>
          
          {/* Recherche rapide */}
          <form action="/shop" method="GET" className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Rechercher une marque, modèle, référence..."
                  className="pl-12 h-12 bg-white text-foreground border-0 shadow-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-secondary hover:bg-secondary/90">
                Rechercher
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Plus consultés */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Plus consultés</h2>
              <p className="text-sm text-neutral-600">Les annonces les plus populaires</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/shop?sort=views">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mostViewed.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Derniers ajouts */}
      <section className="container mx-auto px-4 py-12 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Derniers ajouts</h2>
              <p className="text-sm text-neutral-600">Les nouvelles annonces</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/shop?sort=recent">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showNew />
          ))}
        </div>
      </section>

      {/* Ventes unitaires */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Ventes unitaires</h2>
              <p className="text-sm text-neutral-600">Montures et lunettes à l'unité</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/shop?type=unit">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {units.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Lots */}
      <section className="container mx-auto px-4 py-12 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Vente par lots</h2>
              <p className="text-sm text-neutral-600">Déstockage et lots groupés</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/shop?type=lot">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lots.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à vendre votre stock ?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Créez un compte professionnel et publiez vos annonces gratuitement
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-neutral-100">
              <Link href="/signup">Créer un compte</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/shop">Parcourir les annonces</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}



function ListingCard({ listing, showNew }: { listing: any; showNew?: boolean }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`}>  
      <Card className="group overflow-hidden hover:shadow-lg transition-all border-neutral-200 h-full hover:border-primary/50 hover:-translate-y-1">
        <div className="relative h-24 bg-gradient-to-br from-neutral-100 to-neutral-50">
          {listing.photo ? (
            <Image
              src={listing.photo.photo_url}
              alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isUnit ? (
                <Package className="w-12 h-12 text-neutral-300" />
              ) : (
                <Layers className="w-12 h-12 text-neutral-300" />
              )}
            </div>
          )}

          {showNew && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                NOUVEAU
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {listing.views_count || 0}
          </div>
        </div>

        <CardContent className="p-3">
          {isUnit && details ? (
            <>
              <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                {details.brand} {details.model}
              </h3>
              {details.reference && (
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  {details.reference}
                </p>
              )}
              <p className="text-lg font-bold text-primary">
                {parseFloat(details.price).toFixed(0)}€
              </p>
            </>
          ) : details ? (
            <>
              <h3 className="font-semibold text-sm mb-1">Lot de lunettes</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {details.description}
              </p>
              <p className="text-lg font-bold text-green-600">
                {parseFloat(details.total_price).toFixed(0)}€
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
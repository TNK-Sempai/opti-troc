import { getValidatedUser } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListingCard } from '@/components/shop/ListingCard'
import { ProductCarousel } from '@/components/marketplace/product-carousel'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { FeatureCards } from '@/components/homepage/FeatureCards'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const [validatedUser, supabase] = await Promise.all([
    getValidatedUser(),
    createClient(),
  ])
  const isValidated = validatedUser?.isValidated ?? false

  // Recuperer les annonces pour les differentes sections
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

  // Enrichir les donnees
  const enrichedListings = allListings.map(listing => {
    const details = listing.listing_type === 'unit'
      ? (Array.isArray(listing.unit_listings) ? listing.unit_listings[0] : listing.unit_listings)
      : (Array.isArray(listing.lot_listings) ? listing.lot_listings[0] : listing.lot_listings)

    const photo = listing.listing_photos?.find((p: any) => p.is_primary) || listing.listing_photos?.[0]

    return { ...listing, details, photo }
  })

  // Helper: map listing to ProductCardModern props
  function toProductCard(listing: any) {
    const details = listing.details
    const isUnit = listing.listing_type === 'unit'
    const photos = listing.listing_photos || []
    const primaryPhoto = photos.find((p: any) => p.is_primary)
    const images = primaryPhoto
      ? [primaryPhoto.photo_url, ...photos.filter((p: any) => !p.is_primary).map((p: any) => p.photo_url)]
      : photos.map((p: any) => p.photo_url)

    return {
      id: listing.id,
      title: isUnit && details ? `${details.brand} ${details.model || ''}`.trim() : 'Lot de lunettes',
      price: isUnit ? parseFloat(details?.price || 0) : parseFloat(details?.total_price || 0),
      images,
      condition: details?.state || 'good',
      category: isUnit ? (details?.category || 'frames') : 'other',
      companyName: undefined as string | undefined,
      createdAt: listing.created_at,
    }
  }

  // Sections
  const mostViewed = enrichedListings
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 10)

  const recent = enrichedListings.slice(0, 10)

  const units = enrichedListings
    .filter(l => l.listing_type === 'unit')
    .slice(0, 4)

  const lots = enrichedListings
    .filter(l => l.listing_type === 'lot')
    .slice(0, 4)

  return (
    <div className="min-h-screen">

      {/* ========================================
          HERO — Fond sombre, titre blanc, animations CSS
          ======================================== */}
      <section className="bg-pine-teal py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          {/* Titre H1 — fade-in-up */}
          <h1 className="font-serif text-3xl md:text-5xl text-white font-bold leading-tight animate-fade-in-up">
            Vendez et achetez votre stock optique
          </h1>

          {/* Sous-titre — delay 200ms */}
          <p className="text-lg text-dry-sage mt-4 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            La plateforme de confiance pour les opticiens. Destockage, ventes unitaires et lots professionnels.
          </p>

          {/* Barre de recherche — delay 400ms */}
          <form action="/shop" method="GET" className="max-w-2xl mx-auto mt-8 animate-fade-in-up animation-delay-400">
            <div className="flex gap-2 bg-white rounded-xl shadow-lg p-1.5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fern" />
                <Input
                  name="search"
                  placeholder="Rechercher une marque, modèle, référence..."
                  className="pl-12 h-12 bg-transparent border-0 shadow-none text-charcoal placeholder:text-medium-grey text-base focus-visible:ring-0"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-gold hover:bg-gold-hover text-pine-teal font-semibold border-0 rounded-lg transition-all duration-200">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </form>

          {/* Stats — delay 600ms */}
          <div className="flex justify-center gap-8 md:gap-12 mt-8 animate-fade-in-up animation-delay-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{allListings.length}</div>
              <div className="text-sm text-dry-sage">Annonces actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{units.length}</div>
              <div className="text-sm text-dry-sage">Ventes unitaires</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{lots.length}</div>
              <div className="text-sm text-dry-sage">Lots disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURES — 3 cartes sur fond beige, stagger on scroll
          ======================================== */}
      <FeatureCards />

      {/* Plus consultes - Dust Grey */}
      <section className="bg-dust-grey py-12">
        <div className="container mx-auto px-4">
          <ProductCarousel
            products={mostViewed.map(toProductCard)}
            title="Plus consultés"
            subtitle="Les annonces les plus populaires"
          />
          <div className="mt-4 text-center md:hidden">
            <Button asChild variant="ghost" size="sm" className="text-fern hover:text-pine-teal hover:bg-transparent">
              <Link href="/shop?sort=views">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Derniers ajouts - Off White */}
      <section className="bg-off-white py-12">
        <div className="container mx-auto px-4">
          <ProductCarousel
            products={recent.map(toProductCard)}
            title="Derniers ajouts"
            subtitle="Les nouvelles annonces"
          />
          <div className="mt-4 text-center md:hidden">
            <Button asChild variant="ghost" size="sm" className="text-fern hover:text-pine-teal hover:bg-transparent">
              <Link href="/shop?sort=recent">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Ventes unitaires */}
      <section className="bg-dust-grey py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-pine-teal">Ventes unitaires</h2>
              <p className="text-sm text-medium-grey mt-1">Montures et lunettes a l'unite</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden md:flex text-fern hover:text-pine-teal hover:bg-transparent">
              <Link href="/shop?type=unit">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {units.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isValidated={isValidated} />
            ))}
          </div>
        </div>
      </section>

      {/* Lots - Fern tint */}
      <section className="bg-fern/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-pine-teal">Vente par lots</h2>
              <p className="text-sm text-medium-grey mt-1">Destockage et lots groupes</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden md:flex text-fern hover:text-pine-teal hover:bg-transparent">
              <Link href="/shop?type=lot">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lots.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isValidated={isValidated} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Forest Animated */}
      <section className="bg-forest-animated py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Pret a vendre votre stock ?
          </h2>
          <p className="text-dust-grey/70 mb-8 leading-relaxed">
            Creez un compte professionnel et publiez vos annonces gratuitement. Rejoignez des centaines d'opticiens.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="h-12 px-8 bg-gold hover:bg-gold-hover text-charcoal font-semibold border-0 shadow-gold">
              <Link href="/register">
                Creer un compte
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 border-dust-grey/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/shop">
                Parcourir les annonces
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListingCard } from '@/components/shop/ListingCard'
import { SectionHeader } from '@/components/ui/section-header'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Package, Layers, ArrowRight, Sparkles, Zap, Shield, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const supabase = await createClient()

  // Vérifier le statut de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  let isValidated = false

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    isValidated = profile?.status === 'validated' || profile?.role === 'admin'
  }

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
      ? (Array.isArray(listing.unit_listings) ? listing.unit_listings[0] : listing.unit_listings)
      : (Array.isArray(listing.lot_listings) ? listing.lot_listings[0] : listing.lot_listings)

    const photo = listing.listing_photos?.find((p: any) => p.is_primary) || listing.listing_photos?.[0]

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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">

      {/* Hero Section Moderne */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 animate-float" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 text-center relative">
          {/* Badge animé */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/20 hover:scale-105 transition-transform duration-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide">Marketplace B2B pour professionnels de l'optique</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>

          {/* Titre principal avec gradient */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-white to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
              Vendez et achetez
            </span>
            <span className="block bg-gradient-to-r from-orange-300 via-orange-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
              votre stock optique
            </span>
          </h1>

          <p className="text-xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium">
            La plateforme de confiance pour les opticiens. Déstockage, ventes unitaires et lots professionnels.
          </p>

          {/* Barre de recherche premium */}
          <form action="/shop" method="GET" className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-3 backdrop-blur-xl bg-white/10 p-2 rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <Input
                  name="search"
                  placeholder="Rechercher une marque, modèle, référence..."
                  className="pl-14 h-14 bg-white/95 text-neutral-900 border-0 shadow-lg rounded-xl font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-xl rounded-xl font-bold text-base hover:scale-105 transition-all duration-300">
                <Search className="w-5 h-5 mr-2" />
                Rechercher
              </Button>
            </div>
          </form>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">{allListings.length}</div>
              <div className="text-sm text-blue-200 font-medium">Annonces actives</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">{units.length}</div>
              <div className="text-sm text-blue-200 font-medium">Ventes unitaires</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">{lots.length}</div>
              <div className="text-sm text-blue-200 font-medium">Lots disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Avantages */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-8 border border-blue-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">Rapide & Efficace</h3>
              <p className="text-neutral-600 leading-relaxed">Publiez vos annonces en quelques clics et touchez des milliers de professionnels.</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white to-orange-50/50 rounded-3xl p-8 border border-orange-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">100% Sécurisé</h3>
              <p className="text-neutral-600 leading-relaxed">Tous les comptes sont vérifiés. Transactions sécurisées entre professionnels.</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl p-8 border border-emerald-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">Réseau Pro</h3>
              <p className="text-neutral-600 leading-relaxed">Rejoignez une communauté exclusive de professionnels de l'optique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plus consultés */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader
            icon={TrendingUp}
            title="Plus consultés"
            subtitle="Les annonces les plus populaires"
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
          <Button asChild variant="outline" size="lg" className="hidden md:flex hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300">
            <Link href="/shop?sort=views">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mostViewed.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isValidated={isValidated} />
          ))}
        </div>
      </section>

      {/* Derniers ajouts */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-orange-50/30" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader
              icon={Clock}
              title="Derniers ajouts"
              subtitle="Les nouvelles annonces"
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
            <Button asChild variant="outline" size="lg" className="hidden md:flex hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300">
              <Link href="/shop?sort=recent">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isValidated={isValidated} showNew />
            ))}
          </div>
        </div>
      </section>

      {/* Ventes unitaires */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader
            icon={Package}
            title="Ventes unitaires"
            subtitle="Montures et lunettes à l'unité"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <Button asChild variant="outline" size="lg" className="hidden md:flex hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300">
            <Link href="/shop?type=unit">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {units.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isValidated={isValidated} />
          ))}
        </div>
      </section>

      {/* Lots */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50/30" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader
              icon={Layers}
              title="Vente par lots"
              subtitle="Déstockage et lots groupés"
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
            />
            <Button asChild variant="outline" size="lg" className="hidden md:flex hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300">
              <Link href="/shop?type=lot">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lots.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isValidated={isValidated} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Premium */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-orange-300 animate-pulse" />

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            <span className="block mb-2">Prêt à vendre</span>
            <span className="bg-gradient-to-r from-orange-300 to-yellow-200 bg-clip-text text-transparent">
              votre stock ?
            </span>
          </h2>

          <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Créez un compte professionnel et publiez vos annonces gratuitement. Rejoignez des centaines d'opticiens.
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            <PremiumButton asChild gradient="secondary" glow size="lg" className="text-lg h-14 px-10">
              <Link href="/signup" className="inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Créer un compte</span>
              </Link>
            </PremiumButton>

            <Button asChild size="lg" className="h-14 px-10 text-lg bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl">
              <Link href="/shop">
                Parcourir les annonces
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

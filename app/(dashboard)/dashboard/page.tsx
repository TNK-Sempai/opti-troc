import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'
import { PlusCircle, Package, CheckCircle, Search, TrendingUp, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Récupérer le profil
  const { data: profile } = await supabaseAdmin
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

  const { count: soldListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('status', 'sold')

  const { count: activeWanted } = await supabase
    .from('wanted_items')
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
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="text-forest-gradient drop-shadow-sm">
              Bienvenue, {profile?.first_name} !
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {profile?.company_name} • {profile?.city}
          </p>
        </div>

        {/* Action rapide */}
        <div className="mb-8">
          <PremiumButton asChild size="lg" gradient="secondary" glow className="text-base h-14 px-8 shadow-xl">
            <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span>Créer une nouvelle annonce</span>
            </Link>
          </PremiumButton>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Annonces actives"
            value={activeListings || 0}
            gradient="primary"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total annonces"
            value={totalListings || 0}
            gradient="success"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Annonces vendues"
            value={soldListings || 0}
            gradient="purple"
          />
          <StatCard
            icon={<Search className="w-5 h-5" />}
            label="Recherches actives"
            value={activeWanted || 0}
            gradient="primary"
          />
        </div>

        {/* Dernières annonces */}
        <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden">
          <div className="bg-gradient-to-r from-pine-teal via-hunter-green to-pine-teal p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
            </div>
            <div className="relative">
              <CardTitle className="text-white text-2xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Mes dernières annonces
              </CardTitle>
              <CardDescription className="text-dust-grey/80 text-base font-medium">
                {totalListings === 0
                  ? "Vous n'avez pas encore créé d'annonce"
                  : `${totalListings} annonce(s) au total`
                }
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-6">
            {!recentListings || recentListings.length === 0 ? (
              <div className="text-center py-16 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pine-teal/5 to-dust-grey opacity-50 rounded-xl" />
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pine-teal/20 to-fern/20 rounded-3xl flex items-center justify-center shadow-lg">
                    <Package className="w-12 h-12 text-pine-teal" />
                  </div>
                  <p className="text-dark-grey mb-6 text-lg font-medium">Aucune annonce pour le moment</p>
                  <PremiumButton asChild gradient="primary" glow size="lg" className="shadow-xl">
                    <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      <span>Créer ma première annonce</span>
                    </Link>
                  </PremiumButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {enrichedListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-5 border-2 border-dry-sage/40 rounded-2xl hover:border-fern/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-off-white to-pine-teal/5 hover:scale-[1.02]"
                  >
                    <div className="flex-1">
                      {listing.listing_type === 'unit' && listing.details ? (
                        <>
                          <h3 className="font-bold text-lg mb-1 bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">
                            {listing.details.brand} {listing.details.model}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            {listing.details.reference && `Réf. ${listing.details.reference} • `}
                            <span className="text-gold font-bold">
                              {listing.details.price !== undefined && listing.details.price !== null
                                ? `${Number(listing.details.price).toFixed(0)}€`
                                : 'Prix non défini'}
                            </span>
                          </p>
                        </>
                      ) : listing.listing_type === 'lot' && listing.details ? (
                        <>
                          <h3 className="font-bold text-lg mb-1 bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">
                            Lot de lunettes
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            {listing.details.quantity} pièces • <span className="text-gold font-bold">
                              {listing.details.total_price !== undefined && listing.details.total_price !== null
                                ? `${Number(listing.details.total_price).toFixed(0)}€`
                                : 'Prix non défini'}
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-lg mb-1">Annonce</h3>
                          <p className="text-sm text-muted-foreground">Détails non disponibles</p>
                        </>
                      )}
                    </div>
                    <PremiumButton asChild size="sm" gradient="primary" className="ml-4">
                      <Link href={`/dashboard/listings/${listing.id}`}><span>Voir</span></Link>
                    </PremiumButton>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { PremiumButton } from '@/components/ui/premium-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, User, ArrowRight, Sparkles } from 'lucide-react'
import { WantedItemCard } from '@/components/wanted-items/WantedItemCard'

export const dynamic = 'force-dynamic'

export default async function WantToBuyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Vérifier le statut de l'utilisateur
  let isValidated = false
  let currentUserId = null

  if (user) {
    currentUserId = user.id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    isValidated = profile?.status === 'validated' || profile?.role === 'admin'
  }

  // Récupérer toutes les recherches actives
  const { data: wantedItems, error } = await supabase
    .from('wanted_items')
    .select(`
      *,
      user_profiles(company_name, first_name, last_name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100)

  // Log pour debug
  if (error) {
    console.error('Error fetching wanted items:', error)
  }

  // Grouper les recherches par marque
  const groupedByBrand = wantedItems?.reduce((acc: any, item: any) => {
    const brand = item.brand.toUpperCase()
    if (!acc[brand]) {
      acc[brand] = []
    }
    acc[brand].push(item)
    return acc
  }, {}) || {}

  const brands = Object.keys(groupedByBrand).sort()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white py-20 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 animate-float" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-6 border border-white/20">
              <Search className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">Demandes d'achat des professionnels</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent drop-shadow-lg">
                Want to Buy
              </span>
            </h1>
            <p className="text-xl mb-8 text-emerald-50 leading-relaxed font-medium">
              Découvrez ce que recherchent les opticiens professionnels. Si vous avez l'une de ces paires en stock,
              vous pouvez la proposer directement et le demandeur sera automatiquement notifié.
            </p>

            <div className="flex items-center gap-6 text-base bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold">{wantedItems?.length || 0} recherches actives</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <span className="font-bold">{brands.length} marques recherchées</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA pour utilisateurs connectés */}
      {user && (
        <section className="bg-gradient-to-r from-blue-50 to-emerald-50/50 border-b-2 border-blue-200">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
              <div>
                <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Vous recherchez une paire spécifique ?</h3>
                <p className="text-base text-muted-foreground font-medium">
                  Gérez vos recherches et recevez des notifications automatiques depuis votre dashboard
                </p>
              </div>
              <PremiumButton asChild gradient="primary" glow>
                <Link href="/dashboard/wanted-items" className="inline-flex items-center gap-2">
                  <span>Mes recherches</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </PremiumButton>
            </div>
          </div>
        </section>
      )}

      {/* CTA pour visiteurs */}
      {!user && (
        <section className="bg-gradient-to-r from-blue-50 to-emerald-50/50 border-b-2 border-blue-200">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
              <div>
                <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Vous aussi recherchez une paire ?</h3>
                <p className="text-base text-muted-foreground font-medium">
                  Créez un compte pour publier vos recherches et être notifié automatiquement
                </p>
              </div>
              <div className="flex gap-3">
                <PremiumButton asChild variant="outline" className="border-2">
                  <Link href="/login"><span>Connexion</span></Link>
                </PremiumButton>
                <PremiumButton asChild gradient="primary" glow>
                  <Link href="/register"><span>S'inscrire</span></Link>
                </PremiumButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Liste des recherches */}
      <section className="container mx-auto px-4 py-12">
        {!wantedItems || wantedItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-neutral-200 shadow-xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center shadow-lg">
              <Search className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Aucune recherche active</h3>
            <p className="text-muted-foreground text-lg font-medium">
              Soyez le premier à publier une recherche
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {brands.map((brand) => (
              <div key={brand}>
                <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl p-5 border-2 border-emerald-200 shadow-md">
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">{brand}</h2>
                  <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-lg font-bold text-base px-4 py-1">
                    {groupedByBrand[brand].length} recherche{groupedByBrand[brand].length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedByBrand[brand].map((item: any) => (
                    <WantedItemCard
                      key={item.id}
                      item={item}
                      isValidated={isValidated}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Final */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white py-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-teal-300 animate-pulse" />

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            <span className="block mb-2">Vous avez ces paires</span>
            <span className="bg-gradient-to-r from-teal-300 to-blue-200 bg-clip-text text-transparent">
              en stock ?
            </span>
          </h2>

          <p className="text-xl mb-12 text-emerald-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Publiez vos annonces sur le marketplace et touchez directement les acheteurs intéressés
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            {user ? (
              <PremiumButton asChild size="lg" className="text-lg h-14 px-10 bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-2xl hover:scale-105 transition-all duration-300 font-bold">
                <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Créer une annonce</span>
                </Link>
              </PremiumButton>
            ) : (
              <>
                <PremiumButton asChild size="lg" className="text-lg h-14 px-10 bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-2xl hover:scale-105 transition-all duration-300 font-bold">
                  <Link href="/register" className="inline-flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Créer un compte</span>
                  </Link>
                </PremiumButton>
                <PremiumButton asChild size="lg" variant="outline" className="text-lg h-14 px-10 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-bold shadow-xl">
                  <Link href="/shop" className="inline-flex items-center gap-2">
                    <span>Voir le marketplace</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </PremiumButton>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

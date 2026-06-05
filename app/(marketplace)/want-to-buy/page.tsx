import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, User, ArrowRight } from 'lucide-react'
import { WantedItemCard } from '@/components/wanted-items/WantedItemCard'

export const dynamic = 'force-dynamic'

export default async function WantToBuyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let isValidated = false
  let currentUserId = null

  if (user) {
    currentUserId = user.id
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    isValidated = profile?.status === 'validated' || profile?.role === 'admin'
  }

  const { data: wantedItems, error } = await supabaseAdmin
    .from('wanted_items')
    .select(`
      *,
      user_profiles(company_name, first_name, last_name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    logError('WantToBuyPage', error)
  }

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
    <div className="min-h-screen bg-dust-grey">
      {/* Hero Section */}
      <section className="bg-pine-teal text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-6 border border-white/20">
              <Search className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">Demandes d'achat des professionnels</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight text-white">
              Want to Buy
            </h1>
            <p className="text-xl mb-8 text-dust-grey/80 leading-relaxed">
              Découvrez ce que recherchent les opticiens professionnels. Si vous avez l'une de ces paires en stock,
              vous pouvez la proposer directement et le demandeur sera automatiquement notifié.
            </p>

            <div className="flex items-center gap-6 text-base bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
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
        <section className="border-b border-light-grey">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between bg-off-white rounded-2xl p-6 shadow-card border border-light-grey">
              <div>
                <h3 className="font-serif font-bold text-xl mb-2 text-pine-teal">Vous recherchez une paire spécifique ?</h3>
                <p className="text-base text-dark-grey">
                  Gérez vos recherches et recevez des notifications automatiques depuis votre dashboard
                </p>
              </div>
              <Button asChild className="bg-gold hover:bg-gold-hover text-charcoal font-semibold">
                <Link href="/dashboard/wanted-items" className="inline-flex items-center gap-2">
                  <span>Mes recherches</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA pour visiteurs */}
      {!user && (
        <section className="border-b border-light-grey">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between bg-off-white rounded-2xl p-6 shadow-card border border-light-grey">
              <div>
                <h3 className="font-serif font-bold text-xl mb-2 text-pine-teal">Vous aussi recherchez une paire ?</h3>
                <p className="text-base text-dark-grey">
                  Créez un compte pour publier vos recherches et être notifié automatiquement
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="border-light-grey text-charcoal hover:bg-dust-grey">
                  <Link href="/login"><span>Connexion</span></Link>
                </Button>
                <Button asChild className="bg-gold hover:bg-gold-hover text-charcoal font-semibold">
                  <Link href="/register"><span>S'inscrire</span></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Liste des recherches */}
      <section className="container mx-auto px-4 py-12">
        {!wantedItems || wantedItems.length === 0 ? (
          <div className="text-center py-24 bg-off-white rounded-2xl border border-light-grey shadow-card">
            <div className="w-24 h-24 mx-auto mb-6 bg-dust-grey rounded-2xl flex items-center justify-center">
              <Search className="w-12 h-12 text-pine-teal" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-pine-teal">Aucune recherche active</h3>
            <p className="text-dark-grey text-lg">
              Soyez le premier à publier une recherche
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {brands.map((brand) => (
              <div key={brand}>
                <div className="flex items-center gap-4 mb-6 bg-dust-grey rounded-2xl p-5 border border-light-grey">
                  <h2 className="text-3xl font-serif font-bold text-pine-teal">{brand}</h2>
                  <Badge className="bg-pine-teal text-white border-0 font-bold text-base px-4 py-1">
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
      <section className="bg-pine-teal text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
            Vous avez ces paires en stock ?
          </h2>

          <p className="text-xl mb-12 text-dust-grey/80 max-w-2xl mx-auto leading-relaxed">
            Publiez vos annonces sur le marketplace et touchez directement les acheteurs intéressés
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            {user ? (
              <Button asChild size="lg" className="text-lg h-14 px-10 bg-gold hover:bg-gold-hover text-charcoal font-bold border-0">
                <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2">
                  <span>Créer une annonce</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg h-14 px-10 bg-gold hover:bg-gold-hover text-charcoal font-bold border-0">
                  <Link href="/register" className="inline-flex items-center gap-2">
                    <span>Créer un compte</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg h-14 px-10 border-dust-grey/30 text-white hover:bg-hunter-green hover:text-white">
                  <Link href="/shop" className="inline-flex items-center gap-2">
                    <span>Voir le marketplace</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Séparation dorée */}
      <div className="h-1 bg-gold" />
    </div>
  )
}

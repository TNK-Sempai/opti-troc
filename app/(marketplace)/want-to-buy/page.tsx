import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, User, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Demandes d'achat des professionnels</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              Want to Buy
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Découvrez ce que recherchent les opticiens professionnels. Si vous avez l'une de ces paires en stock,
              vous pouvez la proposer sur le marketplace et le demandeur sera automatiquement notifié.
            </p>

            <div className="flex items-center gap-6 text-sm bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{wantedItems?.length || 0} recherches actives</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                <span>{brands.length} marques recherchées</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA pour utilisateurs connectés */}
      {user && (
        <section className="bg-blue-50 border-b border-blue-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Vous recherchez une paire spécifique ?</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez vos recherches et recevez des notifications automatiques depuis votre dashboard
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/wanted-items">
                  Mes recherches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA pour visiteurs */}
      {!user && (
        <section className="bg-blue-50 border-b border-blue-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Vous aussi recherchez une paire ?</h3>
                <p className="text-sm text-muted-foreground">
                  Créez un compte pour publier vos recherches et être notifié automatiquement
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">S'inscrire</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Liste des recherches */}
      <section className="container mx-auto px-4 py-12">
        {!wantedItems || wantedItems.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Aucune recherche active</h3>
            <p className="text-muted-foreground">
              Soyez le premier à publier une recherche
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {brands.map((brand) => (
              <div key={brand}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{brand}</h2>
                  <Badge variant="secondary">
                    {groupedByBrand[brand].length} recherche{groupedByBrand[brand].length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <section className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous avez ces paires en stock ?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Publiez vos annonces sur le marketplace et touchez directement les acheteurs intéressés
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="bg-white text-primary hover:bg-neutral-100">
                <Link href="/dashboard/listings/new">Créer une annonce</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-white text-primary hover:bg-neutral-100">
                  <Link href="/register">Créer un compte</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/shop">Voir le marketplace</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

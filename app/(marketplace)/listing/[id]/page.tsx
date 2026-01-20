import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ContactSellerButton } from '@/components/messages/ContactSellerButton'
import {
  Eye,
  MapPin,
  Package,
  Calendar,
  ShieldCheck,
  MessageCircle,
  Building2,
  ArrowLeft,
  Share2,
  Ruler,
  Palette,
  Tag,
  Gem,
  Lock
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Vérifier si l'utilisateur est connecté et son statut
  const { data: { user } } = await supabase.auth.getUser()

  let isValidated = false
  let userStatus = null

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    isValidated = profile?.status === 'validated' || profile?.role === 'admin'
    userStatus = profile?.status
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      unit_listings(*),
      lot_listings(*),
      listing_photos(*)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !listing) {
    return notFound()
  }

  // Récupérer le vendeur
  const { data: seller } = await supabase
    .from('user_profiles')
    .select('company_name, city')
    .eq('id', listing.user_id)
    .single()

  const isUnit = listing.listing_type === 'unit'
  const details = isUnit ? listing.unit_listings : listing.lot_listings
  const photos = listing.listing_photos?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  const primaryPhoto = photos.find((p: any) => p.is_primary) || photos[0]

  // Vérifier si l'utilisateur peut contacter (pas son propre listing ET validé)
  const canContact = user && user.id !== listing.user_id && isValidated
  const isOwnListing = user && user.id === listing.user_id

  // Titre pour le bouton de contact
  const listingTitle = isUnit && details
    ? `${details.brand} ${details.model}`
    : details?.description?.substring(0, 50) || 'Lot'

  // Récupérer les items du lot
  let lotItems: any[] = []
  if (!isUnit && listing.lot_listings) {
    const { data } = await supabase
      .from('lot_items')
      .select('*')
      .eq('lot_id', listing.id)
      .order('display_order')
    lotItems = data || []
  }

  // Incrémenter les vues
  supabase.rpc('increment_listing_views', { listing_id: id }).then()


  const stateLabels: Record<string, string> = {
    neuf_etiquette: 'Neuf avec étiquette',
    neuf_sans_etiquette: 'Neuf sans étiquette',
    tres_bon: 'Très bon état',
    bon: 'Bon état'
  }

  const genderLabels: Record<string, string> = {
    homme: 'Homme',
    femme: 'Femme',
    mixte: 'Mixte',
    enfant: 'Enfant'
  }

  const categoryLabels: Record<string, string> = {
    vue: 'Vue',
    solaires: 'Solaires',
    sport: 'Sport'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/20 to-orange-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-6 relative">
        {/* Breadcrumb */}
        <Button asChild variant="ghost" size="lg" className="mb-6 hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-105">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la boutique
          </Link>
        </Button>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-3 space-y-6">
           {/* Galerie photos */}
<Card className="overflow-hidden shadow-2xl border-blue-200/60 backdrop-blur-sm bg-white/95 hover:shadow-glow-primary transition-all duration-500">
  <div className="relative h-80 bg-gradient-to-br from-neutral-50 to-blue-50/30 group">
    {primaryPhoto ? (
      <Image
        src={primaryPhoto.photo_url}
        alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
        fill
        className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-lg">
          <Package className="w-12 h-12 text-blue-600" />
        </div>
      </div>
    )}

    {/* Badges */}
    <div className="absolute top-4 left-4 flex gap-2">
      <Badge className={`${isUnit ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-700'} text-white shadow-lg text-xs h-7 px-3 font-bold border-0`}>
        {isUnit ? '📦 Unitaire' : '📚 Lot'}
      </Badge>
      {details && (
        <Badge variant="outline" className="bg-white/95 backdrop-blur-sm shadow-lg text-xs h-7 px-3 font-semibold border-neutral-300">
          {stateLabels[details.state]}
        </Badge>
      )}
    </div>

    {/* Stats */}
    <div className="absolute bottom-4 right-4 flex gap-2">
      <div className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-lg">
        <Eye className="w-3.5 h-3.5" />
        <span>{listing.views_count || 0}</span>
      </div>
      <div className="bg-gradient-to-r from-orange-600/90 to-orange-700/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-lg">
        <Calendar className="w-3.5 h-3.5" />
        <span>{new Date(listing.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  </div>

  {/* Miniatures */}
  {photos.length > 1 && (
    <div className="p-4 bg-gradient-to-r from-neutral-50 to-blue-50/30 border-t border-blue-100">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo: any) => (
          <div
            key={photo.id}
            className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer ${
              photo.is_primary ? 'border-blue-500 ring-4 ring-blue-200 shadow-lg' : 'border-neutral-300 hover:border-blue-400'
            }`}
          >
            <Image
              src={photo.photo_url}
              alt="Photo"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ))}
      </div>
    </div>
  )}
</Card>

            {/* Titre + Prix Mobile */}
            {isUnit && details && (
              <div className="lg:hidden bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
                <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">{details.brand} {details.model}</h1>
                {details.reference && (
                  <p className="text-xs font-mono text-muted-foreground bg-neutral-100 inline-block px-3 py-1.5 rounded-lg mb-3 font-semibold">Réf: {details.reference}</p>
                )}
                {isValidated ? (
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{parseFloat(details.price).toFixed(0)}€</span>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground bg-neutral-100 rounded-xl p-3 border border-neutral-300">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-semibold">Compte validé requis pour voir le prix</span>
                  </div>
                )}
              </div>
            )}

            {/* Informations produit */}
            <Card className="shadow-xl border-blue-200/60 backdrop-blur-sm bg-white/95">
              <CardContent className="p-6">
                {isUnit && details ? (
                  <>
                    {/* Caractéristiques */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                        <Tag className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                        <div className="text-xs text-muted-foreground mb-1 font-semibold">Genre</div>
                        <div className="font-bold text-sm">{genderLabels[details.gender]}</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                        <Package className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                        <div className="text-xs text-muted-foreground mb-1 font-semibold">Catégorie</div>
                        <div className="font-bold text-sm">{categoryLabels[details.category]}</div>
                      </div>
                      {(details.size_lens || details.size_bridge || details.size_temple) && (
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
                          <Ruler className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                          <div className="text-xs text-muted-foreground mb-1 font-semibold">Dimensions</div>
                          <div className="font-bold text-xs">
                            {details.size_lens && `${details.size_lens}`}
                            {details.size_bridge && `/${details.size_bridge}`}
                            {details.size_temple && `/${details.size_temple}`}
                          </div>
                        </div>
                      )}
                    </div>

                    {(details.frame_color || details.material) && (
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        {details.frame_color && (
                          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 hover:shadow-lg transition-all duration-300">
                            <Palette className="w-5 h-5 mx-auto mb-2 text-amber-600" />
                            <div className="text-xs text-muted-foreground mb-1 font-semibold">Couleur</div>
                            <div className="font-bold text-sm line-clamp-1">{details.frame_color}</div>
                          </div>
                        )}
                        {details.material && (
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                            <Gem className="w-5 h-5 mx-auto mb-2 text-green-600" />
                            <div className="text-xs text-muted-foreground mb-1 font-semibold">Matériau</div>
                            <div className="font-bold text-sm">{details.material}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {details.description && (
                      <>
                        <Separator className="my-4 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                        <div>
                          <h3 className="text-sm font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-600 rounded-full" />
                            Description
                          </h3>
                          <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                            {details.description}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : details ? (
                  <>
                    <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Contenu du lot</h2>

                    {lotItems.length > 0 && (
                      <div className="space-y-3">
                        {lotItems.map((item: any, index: number) => (
                          <div key={item.id} className="p-4 bg-gradient-to-br from-blue-50 to-neutral-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                                    {index + 1}
                                  </span>
                                  <h4 className="font-bold text-base">{item.brand} {item.model}</h4>
                                </div>
                                {item.reference && (
                                  <p className="text-xs font-mono text-muted-foreground ml-9 bg-white px-2 py-1 rounded inline-block font-semibold">Réf: {item.reference}</p>
                                )}
                                <div className="ml-9 text-sm text-muted-foreground mt-1 font-medium">{stateLabels[item.state]}</div>
                              </div>
                              <Badge variant="secondary" className="text-sm h-7 px-3 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-300 font-bold">×{item.quantity}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {details.description && (
                      <>
                        <Separator className="my-4 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                        <div>
                          <h3 className="text-sm font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-600 rounded-full" />
                            Description
                          </h3>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-xl p-4 border border-neutral-200">{details.description}</p>
                        </div>
                      </>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-5">
              {/* Titre Desktop */}
              {isUnit && details && (
                <div className="hidden lg:block bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">{details.brand} {details.model}</h1>
                  {details.reference && (
                    <p className="text-xs font-mono text-muted-foreground bg-neutral-100 inline-block px-3 py-1.5 rounded-lg font-semibold">
                      Réf: {details.reference}
                    </p>
                  )}
                </div>
              )}

              {/* Prix et Actions */}
              <Card className="shadow-2xl border-blue-200/60 overflow-hidden backdrop-blur-sm bg-white/95">
                {isValidated ? (
                  <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                    </div>
                    <span className="text-4xl font-extrabold relative drop-shadow-lg">
                      {isUnit && details
                        ? `${parseFloat(details.price).toFixed(0)}€`
                        : `${parseFloat(details?.total_price || 0).toFixed(0)}€`
                      }
                    </span>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-neutral-500 to-neutral-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                    </div>
                    <div className="flex items-center gap-3 relative">
                      <Lock className="w-7 h-7" />
                      <div>
                        <p className="text-base font-bold">Prix masqué</p>
                        <p className="text-sm opacity-90">Compte validé requis</p>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="p-5 space-y-3">
                  {canContact ? (
                    <ContactSellerButton
                      listingId={listing.id}
                      sellerName={seller?.company_name || 'le vendeur'}
                      listingTitle={listingTitle}
                    />
                  ) : isOwnListing ? (
                    <Button disabled className="w-full h-12 text-base font-bold shadow-lg">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Votre annonce
                    </Button>
                  ) : user && !isValidated ? (
                    <div className="space-y-3">
                      <Button disabled className="w-full h-12 text-base font-bold shadow-lg">
                        <Lock className="w-5 h-5 mr-2" />
                        Contacter le vendeur
                      </Button>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-amber-300 rounded-xl p-4 shadow-md">
                        <p className="text-sm text-amber-800 font-bold mb-2">
                          {userStatus === 'pending' ? '⏳ Compte en attente de validation' : '🔒 Compte non validé'}
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {userStatus === 'pending'
                            ? 'Votre compte est en cours de validation par un administrateur. Vous pourrez voir les prix et contacter les vendeurs une fois validé.'
                            : 'Votre compte doit être validé pour voir les prix et contacter les vendeurs.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button asChild className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-0 hover:scale-105 transition-all duration-300">
                        <Link href="/login">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Connectez-vous pour contacter
                        </Link>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Ou <Link href="/register" className="text-blue-600 hover:underline font-bold">créez un compte</Link> pour accéder aux prix
                      </p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border-2 hover:border-blue-400 hover:text-blue-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </CardContent>
              </Card>

              {/* Vendeur */}
              {seller && (
                <Card className="shadow-xl border-emerald-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase relative flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Vendeur
                    </h3>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{seller.company_name}</h3>
                        {seller.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            {seller.city}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-4 py-2.5 rounded-xl border border-emerald-300 shadow-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-bold">Professionnel vérifié</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

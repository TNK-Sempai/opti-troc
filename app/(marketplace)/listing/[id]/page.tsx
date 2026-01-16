import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Gem
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link href="/shop">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Retour
          </Link>
        </Button>
  
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Colonne principale */}
          <div className="lg:col-span-3 space-y-3">
           {/* Galerie photos */}
<Card className="overflow-hidden shadow-md border-primary/10">
  <div className="relative h-64 bg-white">
    {primaryPhoto ? (
      <Image
        src={primaryPhoto.photo_url}
        alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
        fill
        className="object-contain p-3"
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
        <Package className="w-12 h-12 text-neutral-300" />
      </div>
    )}

    {/* Badges */}
    <div className="absolute top-2 left-2 flex gap-1.5">
      <Badge className={`${isUnit ? 'bg-primary' : 'bg-green-600'} text-white shadow-sm text-[10px] h-5 px-2`}>
        {isUnit ? 'Unitaire' : 'Lot'}
      </Badge>
      {details && (
        <Badge variant="outline" className="bg-white/95 shadow-sm text-[10px] h-5 px-2">
          {stateLabels[details.state]}
        </Badge>
      )}
    </div>

    {/* Stats */}
    <div className="absolute bottom-2 right-2 flex gap-1.5">
      <div className="bg-black/50 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
        <Eye className="w-2.5 h-2.5" />
        <span>{listing.views_count || 0}</span>
      </div>
      <div className="bg-black/50 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
        <Calendar className="w-2.5 h-2.5" />
        <span>{new Date(listing.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  </div>

  {/* Miniatures */}
  {photos.length > 1 && (
    <div className="p-2 bg-neutral-50 border-t">
      <div className="flex gap-1.5 overflow-x-auto">
        {photos.map((photo: any) => (
          <div 
            key={photo.id} 
            className={`relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border ${
              photo.is_primary ? 'border-primary ring-1 ring-primary/20' : 'border-neutral-200'
            }`}
          >
            <Image
              src={photo.photo_url}
              alt="Photo"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ))}
      </div>
    </div>
  )}
</Card>
  
            {/* Titre + Prix Mobile */}
            {isUnit && details && (
              <div className="lg:hidden">
                <h1 className="text-lg font-bold mb-1">{details.brand} {details.model}</h1>
                {details.reference && (
                  <p className="text-[10px] font-mono text-muted-foreground mb-2">Réf: {details.reference}</p>
                )}
                <span className="text-2xl font-bold text-primary">{parseFloat(details.price).toFixed(0)}€</span>
              </div>
            )}
  
            {/* Informations produit */}
            <Card className="shadow-md border-primary/10">
              <CardContent className="p-4">
                {isUnit && details ? (
                  <>
                    {/* Caractéristiques */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-primary/5 rounded">
                        <Tag className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
                        <div className="text-[9px] text-muted-foreground mb-0.5">Genre</div>
                        <div className="font-semibold text-xs">{genderLabels[details.gender]}</div>
                      </div>
                      <div className="text-center p-2 bg-blue-500/5 rounded">
                        <Package className="w-3.5 h-3.5 mx-auto mb-1 text-blue-600" />
                        <div className="text-[9px] text-muted-foreground mb-0.5">Catégorie</div>
                        <div className="font-semibold text-xs">{categoryLabels[details.category]}</div>
                      </div>
                      {(details.size_lens || details.size_bridge || details.size_temple) && (
                        <div className="text-center p-2 bg-purple-500/5 rounded">
                          <Ruler className="w-3.5 h-3.5 mx-auto mb-1 text-purple-600" />
                          <div className="text-[9px] text-muted-foreground mb-0.5">Dimensions</div>
                          <div className="font-semibold text-[10px]">
                            {details.size_lens && `${details.size_lens}`}
                            {details.size_bridge && `/${details.size_bridge}`}
                            {details.size_temple && `/${details.size_temple}`}
                          </div>
                        </div>
                      )}
                    </div>
  
                    {(details.frame_color || details.material) && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {details.frame_color && (
                          <div className="text-center p-2 bg-amber-500/5 rounded">
                            <Palette className="w-3.5 h-3.5 mx-auto mb-1 text-amber-600" />
                            <div className="text-[9px] text-muted-foreground mb-0.5">Couleur</div>
                            <div className="font-semibold text-[10px] line-clamp-1">{details.frame_color}</div>
                          </div>
                        )}
                        {details.material && (
                          <div className="text-center p-2 bg-green-500/5 rounded">
                            <Gem className="w-3.5 h-3.5 mx-auto mb-1 text-green-600" />
                            <div className="text-[9px] text-muted-foreground mb-0.5">Matériau</div>
                            <div className="font-semibold text-[10px]">{details.material}</div>
                          </div>
                        )}
                      </div>
                    )}
  
                    {/* Description */}
                    {details.description && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
                            Description
                          </h3>
                          <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-wrap">
                            {details.description}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : details ? (
                  <>
                    <h2 className="text-base font-bold mb-3">Contenu du lot</h2>
                    
                    {lotItems.length > 0 && (
                      <div className="space-y-2">
                        {lotItems.map((item: any, index: number) => (
                          <div key={item.id} className="p-2 bg-neutral-50 rounded border border-neutral-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                                    {index + 1}
                                  </span>
                                  <h4 className="font-bold text-xs">{item.brand} {item.model}</h4>
                                </div>
                                {item.reference && (
                                  <p className="text-[10px] font-mono text-muted-foreground ml-5">Réf: {item.reference}</p>
                                )}
                                <div className="ml-5 text-[10px] text-muted-foreground">{stateLabels[item.state]}</div>
                              </div>
                              <Badge variant="secondary" className="text-[10px] h-5">×{item.quantity}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
  
                    {details.description && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
                            Description
                          </h3>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{details.description}</p>
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
            <div className="sticky top-20 space-y-3">
              {/* Titre Desktop */}
              {isUnit && details && (
                <div className="hidden lg:block">
                  <h1 className="text-xl font-bold mb-1">{details.brand} {details.model}</h1>
                  {details.reference && (
                    <p className="text-[10px] font-mono text-muted-foreground bg-neutral-100 inline-block px-2 py-0.5 rounded">
                      Réf: {details.reference}
                    </p>
                  )}
                </div>
              )}
  
              {/* Prix et Actions */}
              <Card className="shadow-md border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-4 text-white">
                  <span className="text-3xl font-bold">
                    {isUnit && details 
                      ? `${parseFloat(details.price).toFixed(0)}€`
                      : `${parseFloat(details?.total_price || 0).toFixed(0)}€`
                    }
                  </span>
                </div>
  
                <CardContent className="p-3 space-y-2">
                  <Button className="w-full h-9 text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="w-full h-8 text-sm">
                    <Share2 className="w-3 h-3 mr-1.5" />
                    Partager
                  </Button>
                </CardContent>
              </Card>
  
              {/* Vendeur */}
              {seller && (
                <Card className="shadow-md border-neutral-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{seller.company_name}</h3>
                        {seller.city && (
                          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <MapPin className="w-2.5 h-2.5" />
                            {seller.city}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="font-medium">Vérifié</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) }
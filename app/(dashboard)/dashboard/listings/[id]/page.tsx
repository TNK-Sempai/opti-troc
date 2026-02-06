import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Edit, Trash2, Eye, Calendar, MapPin, Package } from 'lucide-react'
import { deleteListing } from './actions'

export const dynamic = 'force-dynamic'

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer le listing parent
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!listing) notFound()

  // Récupérer les photos
  const { data: photos } = await supabase
    .from('listing_photos')
    .select('*')
    .eq('listing_id', id)
    .order('display_order')

  // Récupérer les détails selon le type
  let details = null
  let lotItems = null

  if (listing.listing_type === 'unit') {
    const { data } = await supabase
      .from('unit_listings')
      .select('*')
      .eq('listing_id', id)
      .single()
    details = data
  } else {
    const { data: lotData } = await supabase
      .from('lot_listings')
      .select('*')
      .eq('listing_id', id)
      .single()

    const { data: items } = await supabase
      .from('lot_items')
      .select('*')
      .eq('lot_id', id)
      .order('display_order')

    details = lotData
    lotItems = items
  }

  if (!details) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm" className="text-pine-teal hover:text-pine-teal hover:bg-pine-teal/10">
          <Link href="/dashboard/listings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Mes annonces
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-pine-teal text-pine-teal hover:bg-pine-teal/10">
            <Link href={`/dashboard/listings/${listing.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Link>
          </Button>
          <form action={deleteListing}>
            <input type="hidden" name="listingId" value={listing.id} />
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </form>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {photos && photos.length > 0 && (
            <Card className="bg-off-white border-light-grey">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className={`relative rounded-lg overflow-hidden ${
                        photo.is_primary ? 'col-span-2 aspect-video' : 'aspect-square'
                      }`}
                    >
                      <Image
                        src={photo.photo_url}
                        alt="Photo produit"
                        fill
                        className="object-cover"
                        sizes={photo.is_primary ? "100vw" : "50vw"}
                      />
                      {photo.is_primary && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-pine-teal text-white">Photo principale</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annonce unitaire */}
          {listing.listing_type === 'unit' && details && (
            <>
              <Card className="bg-off-white border-light-grey">
                <CardHeader>
                  <CardTitle className="text-pine-teal font-serif">Détails du produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-medium-grey">Marque</p>
                      <p className="font-medium text-charcoal">{details.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-medium-grey">Modèle</p>
                      <p className="font-medium text-charcoal">{details.model}</p>
                    </div>
                    {details.reference && (
                      <div>
                        <p className="text-sm text-medium-grey">Référence</p>
                        <p className="font-medium font-mono text-sm text-charcoal">{details.reference}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-medium-grey">Genre</p>
                      <p className="font-medium text-charcoal">
                        {details.gender === 'homme' ? 'Homme' :
                         details.gender === 'femme' ? 'Femme' :
                         details.gender === 'mixte' ? 'Mixte' : 'Enfant'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-medium-grey">Type</p>
                      <p className="font-medium text-charcoal">
                        {details.category === 'vue' ? 'Optique (Vue)' :
                         details.category === 'solaires' ? 'Solaires' : 'Sport'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-medium-grey">État</p>
                      <p className="font-medium text-charcoal">
                        {details.state === 'neuf_etiquette' ? 'Neuf avec étiquette' :
                         details.state === 'neuf_sans_etiquette' ? 'Neuf sans étiquette' :
                         details.state === 'tres_bon' ? 'Très bon état' : 'Bon état'}
                      </p>
                    </div>
                  </div>

                  {/* Couleurs et matériau */}
                  {(details.color_frame || details.color_lens || details.material) && (
                    <>
                      <div className="border-t border-light-grey my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        {details.color_frame && (
                          <div>
                            <p className="text-sm text-medium-grey">Couleur monture</p>
                            <p className="font-medium text-charcoal">{details.color_frame}</p>
                          </div>
                        )}
                        {details.color_lens && (
                          <div>
                            <p className="text-sm text-medium-grey">Couleur verres</p>
                            <p className="font-medium text-charcoal">{details.color_lens}</p>
                          </div>
                        )}
                        {details.material && (
                          <div>
                            <p className="text-sm text-medium-grey">Matériau</p>
                            <p className="font-medium text-charcoal">{details.material}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Dimensions */}
                  {(details.size_lens || details.size_bridge || details.size_temple) && (
                    <>
                      <div className="border-t border-light-grey my-4" />
                      <div>
                        <p className="text-sm text-medium-grey mb-2">Dimensions</p>
                        <div className="flex gap-4 text-sm">
                          {details.size_lens && (
                            <div>
                              <span className="text-medium-grey">Verres:</span>{' '}
                              <span className="font-medium text-charcoal">{details.size_lens}mm</span>
                            </div>
                          )}
                          {details.size_bridge && (
                            <div>
                              <span className="text-medium-grey">Pont:</span>{' '}
                              <span className="font-medium text-charcoal">{details.size_bridge}mm</span>
                            </div>
                          )}
                          {details.size_temple && (
                            <div>
                              <span className="text-medium-grey">Branches:</span>{' '}
                              <span className="font-medium text-charcoal">{details.size_temple}mm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-off-white border-light-grey">
                <CardHeader>
                  <CardTitle className="text-pine-teal font-serif">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-dark-grey">{details.description}</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Annonce lot */}
          {listing.listing_type === 'lot' && details && lotItems && (
            <>
              <Card className="bg-off-white border-light-grey">
                <CardHeader>
                  <CardTitle className="text-pine-teal font-serif">Articles du lot ({lotItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lotItems.map((item: any) => (
                      <div key={item.id} className="p-4 border border-light-grey rounded-lg bg-dust-grey">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-charcoal">
                              {item.brand} {item.model}
                            </p>
                            {item.reference && (
                              <p className="text-sm font-mono text-medium-grey">{item.reference}</p>
                            )}
                            <p className="text-sm text-medium-grey mt-1">
                              {item.state === 'neuf_etiquette' ? 'Neuf avec étiquette' :
                               item.state === 'neuf_sans_etiquette' ? 'Neuf sans étiquette' :
                               item.state === 'tres_bon' ? 'Très bon état' : 'Bon état'}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-light-grey text-charcoal">
                            <Package className="w-3 h-3 mr-1" />
                            x{item.quantity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-off-white border-light-grey">
                <CardHeader>
                  <CardTitle className="text-pine-teal font-serif">Description du lot</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-dark-grey">{details.description}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-off-white border-light-grey">
            <CardHeader>
              <CardTitle className="text-pine-teal font-serif">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statut */}
              <div>
                <p className="text-sm text-medium-grey mb-2">Statut</p>
                <Badge className={
                  listing.status === 'active' ? 'bg-success text-white' :
                  listing.status === 'sold' ? 'bg-gold text-charcoal' :
                  listing.status === 'paused' ? 'bg-warning text-charcoal' : 'bg-medium-grey text-white'
                }>
                  {listing.status === 'active' ? 'Actif' :
                   listing.status === 'sold' ? 'Vendu' :
                   listing.status === 'paused' ? 'Pausé' : 'Inactif'}
                </Badge>
              </div>

              {/* Prix */}
              <div>
                <p className="text-sm text-medium-grey mb-1">Prix</p>
                {listing.listing_type === 'unit' && details ? (
                  <p className="text-3xl font-bold text-pine-teal">
                    {parseFloat(details.price).toFixed(2)}€
                  </p>
                ) : listing.listing_type === 'lot' && details ? (
                  <p className="text-3xl font-bold text-gold">
                    {parseFloat(details.total_price).toFixed(2)}€
                  </p>
                ) : null}
              </div>

              {/* Remise en main propre */}
              {listing.listing_type === 'unit' && details?.allow_hand_delivery && (
                <div className="flex items-center gap-2 text-sm text-dark-grey p-3 bg-dust-grey border border-light-grey rounded-lg">
                  <MapPin className="w-4 h-4 text-pine-teal" />
                  <span>Remise en main propre possible</span>
                </div>
              )}

              {/* Vente partielle */}
              {listing.listing_type === 'lot' && details?.allow_partial_sale && (
                <div className="flex items-center gap-2 text-sm text-dark-grey p-3 bg-dust-grey border border-light-grey rounded-lg">
                  <Package className="w-4 h-4 text-pine-teal" />
                  <span>Vente partielle acceptée</span>
                </div>
              )}

              {/* Stats */}
              <div className="border-t border-light-grey pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-medium-grey">
                    <Eye className="w-4 h-4" />
                    <span>Vues</span>
                  </div>
                  <span className="font-semibold text-charcoal">{listing.views_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-medium-grey">
                    <Calendar className="w-4 h-4" />
                    <span>Créée le</span>
                  </div>
                  <span className="font-semibold text-sm text-charcoal">
                    {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Layers, Eye } from 'lucide-react'

export function ListingCardList({ listing }: { listing: any }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all border-light-grey hover:border-primary/50">
        <CardContent className="p-0">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-48 h-32 flex-shrink-0 bg-gradient-to-br from-dust-grey to-off-white">
              {listing.photo ? (
                <Image
                  src={listing.photo.photo_url}
                  alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="200px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isUnit ? (
                    <Package className="w-12 h-12 text-dry-sage" />
                  ) : (
                    <Layers className="w-12 h-12 text-dry-sage" />
                  )}
                </div>
              )}

              <div className="absolute top-2 left-2">
                <Badge className={`text-xs ${isUnit ? 'bg-primary' : 'bg-fern'} shadow-lg`}>
                  {isUnit ? 'Unitaire' : 'Lot'}
                </Badge>
              </div>

              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.views_count || 0}
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 py-4 pr-4">
              {isUnit && details ? (
                <div>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-primary/70 mb-1">MARQUE</p>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {details.brand}
                    </h3>
                  </div>

                  {details.model && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-primary/70 mb-1">MODÈLE</p>
                      <p className="font-semibold">{details.model}</p>
                    </div>
                  )}

                  {details.reference && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-primary/70 mb-1">RÉFÉRENCE</p>
                      <p className="text-xs font-mono bg-dust-grey px-2 py-1 rounded inline-block">
                        {details.reference}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-primary">
                      {parseFloat(details.price).toFixed(0)}€
                    </p>
                    {details.gender && (
                      <Badge variant="outline" className="text-xs">
                        {details.gender}
                      </Badge>
                    )}
                    {details.category && (
                      <Badge variant="outline" className="text-xs">
                        {details.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : details ? (
                <div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-fern transition-colors">
                    Lot de lunettes
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {details.description}
                  </p>
                  <p className="text-2xl font-bold text-fern">
                    {parseFloat(details.total_price).toFixed(0)}€
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

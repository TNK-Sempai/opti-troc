import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Layers, Eye } from 'lucide-react'

export function ListingCardGrid({ listing }: { listing: any }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-light-grey h-full hover:border-primary/50 hover:-translate-y-1">
        <div className="relative h-40 bg-gradient-to-br from-dust-grey to-off-white">
          {listing.photo ? (
            <Image
              src={listing.photo.photo_url}
              alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isUnit ? (
                <Package className="w-10 h-10 text-dry-sage" />
              ) : (
                <Layers className="w-10 h-10 text-dry-sage" />
              )}
            </div>
          )}

          <div className="absolute top-2 left-2">
            <Badge className={`text-xs ${isUnit ? 'bg-primary' : 'bg-fern'} shadow-lg`}>
              {isUnit ? 'Unit' : 'Lot'}
            </Badge>
          </div>

          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {listing.views_count || 0}
          </div>
        </div>

        <CardContent className="p-4">
          {isUnit && details ? (
            <>
              <div className="mb-2">
                <p className="text-xs font-medium text-primary/70 mb-1">MARQUE</p>
                <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                  {details.brand}
                </h3>
              </div>

              {details.model && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-primary/70 mb-1">MODÈLE</p>
                  <p className="font-semibold text-sm line-clamp-1">
                    {details.model}
                  </p>
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

              <div className="pt-3 border-t border-light-grey">
                <p className="text-xl font-bold text-primary">
                  {parseFloat(details.price).toFixed(0)}€
                </p>
              </div>
            </>
          ) : details ? (
            <>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-fern transition-colors">
                Lot de lunettes
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {details.description}
              </p>
              <p className="text-lg font-bold text-fern">
                {parseFloat(details.total_price).toFixed(0)}€
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

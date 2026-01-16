'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Layers, Eye, Edit, Trash2 } from 'lucide-react'
import { deleteListing } from './[id]/actions'

export default function ListingsGrid({ listings }: { listings: any[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <Card 
          key={listing.id} 
          className="group overflow-hidden hover:shadow-md transition-all border-neutral-200"
        >
          {/* Image compacte */}
          <div className="relative h-40 bg-neutral-50">
            {listing.photo ? (
              <Image
                src={listing.photo.photo_url}
                alt={listing.listing_type === 'unit' && listing.details 
                  ? `${listing.details.brand} ${listing.details.model}` 
                  : 'Lot'}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {listing.listing_type === 'unit' ? (
                  <Package className="w-10 h-10 text-neutral-300" />
                ) : (
                  <Layers className="w-10 h-10 text-neutral-300" />
                )}
              </div>
            )}
            
            {/* Badges compacts */}
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge 
                className={`text-xs ${
                  listing.listing_type === 'unit' ? 'bg-primary' : 'bg-green-600'
                }`}
              >
                {listing.listing_type === 'unit' ? 'Unit' : 'Lot'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  listing.status === 'active'
                    ? 'bg-white/95 border-green-200 text-green-700'
                    : 'bg-white/95 border-neutral-200'
                }`}
              >
                {listing.status === 'active' ? '●' : '○'}
              </Badge>
            </div>
          </div>

          {/* Contenu compact */}
          <div className="p-3">
            {listing.listing_type === 'unit' && listing.details ? (
              <>
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                  {listing.details.brand} {listing.details.model}
                </h3>
                {listing.details.reference && (
                  <p className="text-xs font-mono text-neutral-500 mb-2">
                    {listing.details.reference}
                  </p>
                )}
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-lg font-bold text-primary">
                    {parseFloat(listing.details.price).toFixed(0)}€
                  </span>
                  <div className="flex gap-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {listing.views_count || 0}
                    </span>
                  </div>
                </div>
              </>
            ) : listing.listing_type === 'lot' && listing.details ? (
              <>
                <h3 className="font-semibold text-sm mb-1">Lot de lunettes</h3>
                <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
                  {listing.details.description}
                </p>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-lg font-bold text-green-600">
                    {parseFloat(listing.details.total_price).toFixed(0)}€
                  </span>
                  <div className="flex gap-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {listing.views_count || 0}
                    </span>
                  </div>
                </div>
              </>
            ) : null}

            {/* Boutons */}
            <div className="space-y-2">
              <Button asChild size="sm" className="w-full h-8 text-xs">
                <Link href={`/dashboard/listings/${listing.id}`}>
                  Voir l'annonce
                </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Link>
                </Button>
                
                <form action={deleteListing}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <Button 
                    type="submit" 
                    size="sm" 
                    variant="destructive" 
                    className="w-full h-8 text-xs"
                    onClick={(e) => {
                      if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
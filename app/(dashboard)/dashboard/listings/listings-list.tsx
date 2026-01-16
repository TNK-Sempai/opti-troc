'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Layers, Eye, Calendar, Edit, Trash2 } from 'lucide-react'
import { deleteListing } from './[id]/actions'

export default function ListingsList({ listings }: { listings: any[] }) {
  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow border-neutral-200">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="relative w-24 h-24 flex-shrink-0 bg-neutral-50 rounded overflow-hidden">
              {listing.photo ? (
                <Image
                  src={listing.photo.photo_url}
                  alt="Produit"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {listing.listing_type === 'unit' ? (
                    <Package className="w-8 h-8 text-neutral-300" />
                  ) : (
                    <Layers className="w-8 h-8 text-neutral-300" />
                  )}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  {listing.listing_type === 'unit' && listing.details ? (
                    <>
                      <h3 className="font-semibold text-base truncate">
                        {listing.details.brand} {listing.details.model}
                      </h3>
                      {listing.details.reference && (
                        <p className="text-sm font-mono text-neutral-600">
                          {listing.details.reference}
                        </p>
                      )}
                    </>
                  ) : listing.listing_type === 'lot' && listing.details ? (
                    <>
                      <h3 className="font-semibold text-base">Lot de lunettes</h3>
                      <p className="text-sm text-neutral-600 line-clamp-1">
                        {listing.details.description}
                      </p>
                    </>
                  ) : null}
                </div>

                {/* Prix */}
                <div className="text-right flex-shrink-0">
                  {listing.listing_type === 'unit' && listing.details ? (
                    <p className="text-xl font-bold text-primary">
                      {parseFloat(listing.details.price).toFixed(2)}€
                    </p>
                  ) : listing.listing_type === 'lot' && listing.details ? (
                    <p className="text-xl font-bold text-green-600">
                      {parseFloat(listing.details.total_price).toFixed(2)}€
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={listing.listing_type === 'unit' ? 'bg-primary' : 'bg-green-600'}>
                    {listing.listing_type === 'unit' ? 'Unitaire' : 'Lot'}
                  </Badge>
                  <Badge variant="outline" className={
                    listing.status === 'active' ? 'border-green-600 text-green-700' : ''
                  }>
                    {listing.status === 'active' ? 'Actif' : 
                     listing.status === 'sold' ? 'Vendu' : 'Pausé'}
                  </Badge>
                  
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(listing.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/listings/${listing.id}`}>
                      Voir
                    </Link>
                  </Button>
                  <form action={deleteListing}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <Button 
                      type="submit" 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
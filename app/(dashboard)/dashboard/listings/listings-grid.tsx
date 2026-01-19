'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Layers, Eye, Edit, Trash2, ExternalLink } from 'lucide-react'
import { deleteListing } from './[id]/actions'

export default function ListingsGrid({ listings }: { listings: any[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => {
        const isUnit = listing.listing_type === 'unit'
        const details = listing.details
        const isActive = listing.status === 'active'

        return (
          <Card
            key={listing.id}
            className={`group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 h-full flex flex-col ${
              isActive
                ? 'border-blue-200/60 hover:border-blue-400'
                : 'border-neutral-200 opacity-75'
            }`}
          >
            {/* Image avec overlay moderne */}
            <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden">
              {listing.photo ? (
                <Image
                  src={listing.photo.photo_url}
                  alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isUnit ? (
                    <Package className="w-14 h-14 text-neutral-300" />
                  ) : (
                    <Layers className="w-14 h-14 text-neutral-300" />
                  )}
                </div>
              )}

              {/* Badges en haut */}
              <div className="absolute top-3 left-3 flex gap-2 z-10">
                <Badge className={`text-xs font-bold border-0 shadow-lg ${
                  isUnit
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                }`}>
                  {isUnit ? 'Unitaire' : 'Lot'}
                </Badge>
              </div>

              {/* Status badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className={`text-xs font-bold border-0 shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                    : listing.status === 'sold'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                }`}>
                  {listing.status === 'active' ? 'Active' : listing.status === 'sold' ? 'Vendue' : 'En pause'}
                </Badge>
              </div>

              {/* Vues en bas */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold z-10">
                <Eye className="w-3.5 h-3.5" />
                {listing.views_count || 0}
              </div>
            </div>

            {/* Contenu */}
            <CardContent className="p-5 flex-1 flex flex-col">
              {isUnit && details ? (
                <>
                  {/* Marque & Modèle */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg line-clamp-1 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                      {details.brand}
                    </h3>
                    {details.model && (
                      <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                        {details.model}
                      </p>
                    )}
                  </div>

                  {/* Référence */}
                  {details.reference && (
                    <p className="text-xs font-mono bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg inline-block mb-3 font-semibold w-fit">
                      {details.reference}
                    </p>
                  )}

                  {/* Prix */}
                  <div className="mt-auto pt-3 border-t border-neutral-100">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {parseFloat(details.price).toFixed(0)}€
                    </span>
                  </div>
                </>
              ) : details ? (
                <>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                    Lot de lunettes
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-medium flex-1">
                    {details.description}
                  </p>
                  <div className="mt-auto pt-3 border-t border-neutral-100">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      {parseFloat(details.total_price).toFixed(0)}€
                    </span>
                  </div>
                </>
              ) : null}

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <PremiumButton asChild size="sm" gradient="primary" className="w-full">
                  <Link href={`/dashboard/listings/${listing.id}`} className="inline-flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>Voir l'annonce</span>
                  </Link>
                </PremiumButton>

                <div className="grid grid-cols-2 gap-2">
                  <PremiumButton asChild size="sm" variant="outline" className="border-2 border-blue-200 hover:border-blue-400">
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="inline-flex items-center justify-center gap-1.5">
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </Link>
                  </PremiumButton>

                  <form action={deleteListing}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <PremiumButton
                      type="submit"
                      size="sm"
                      gradient="danger"
                      className="w-full"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </span>
                    </PremiumButton>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
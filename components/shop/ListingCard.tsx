'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Layers, Eye, Lock, Sparkles, TrendingUp } from 'lucide-react'

interface ListingCardProps {
  listing: any
  isValidated?: boolean
  showNew?: boolean
  variant?: 'grid' | 'list'
}

export function ListingCard({
  listing,
  isValidated = false,
  showNew = false,
  variant = 'grid'
}: ListingCardProps) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  if (variant === 'list') {
    return <ListingCardListView listing={listing} isValidated={isValidated} />
  }

  return (
    <Link href={`/listing/${listing.id}`} className="block h-full">
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-neutral-200/60 h-full hover:border-primary/60 hover:-translate-y-2 hover:shadow-glow-primary bg-white">
        {/* Glow effect sur hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Image container avec gradient overlay */}
        <div className="relative h-52 bg-gradient-to-br from-neutral-50 via-blue-50/30 to-orange-50/30 overflow-hidden">
          {listing.photo ? (
            <div className="relative w-full h-full">
              <Image
                src={listing.photo.photo_url}
                alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              {/* Dark gradient overlay for better badge visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50">
              {isUnit ? (
                <Package className="w-16 h-16 text-neutral-300 group-hover:text-primary/30 transition-colors duration-500" />
              ) : (
                <Layers className="w-16 h-16 text-neutral-300 group-hover:text-green-600/30 transition-colors duration-500" />
              )}
            </div>
          )}

          {/* Badges avec effets améliorés */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <Badge className={`text-xs font-semibold shadow-xl backdrop-blur-sm border-0 ${
              isUnit
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
            } group-hover:scale-110 transition-transform duration-300`}>
              {isUnit ? 'Unitaire' : 'Lot'}
            </Badge>
            {showNew && (
              <Badge className="text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl backdrop-blur-sm border-0 animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                NOUVEAU
              </Badge>
            )}
          </div>

          {/* Vue counter avec animation */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300 z-10">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-semibold">{listing.views_count || 0}</span>
          </div>
        </div>

        <CardContent className="p-5 relative">
          {isUnit && details ? (
            <>
              {/* Marque avec animation */}
              <div className="mb-3">
                <p className="text-[10px] font-bold tracking-wider text-primary/60 mb-1 uppercase">Marque</p>
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1 transition-transform">
                  {details.brand}
                </h3>
              </div>

              {/* Modèle */}
              {details.model && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold tracking-wider text-primary/60 mb-1 uppercase">Modèle</p>
                  <p className="font-semibold text-sm line-clamp-1 text-neutral-700">
                    {details.model}
                  </p>
                </div>
              )}

              {/* Référence avec style moderne */}
              {details.reference && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold tracking-wider text-primary/60 mb-1 uppercase">Référence</p>
                  <p className="text-xs font-mono bg-gradient-to-r from-neutral-100 to-neutral-50 px-3 py-1.5 rounded-lg inline-block border border-neutral-200 font-semibold">
                    {details.reference}
                  </p>
                </div>
              )}

              {/* Prix avec design premium */}
              <div className="pt-4 border-t border-neutral-100">
                {isValidated ? (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      {parseFloat(details.price).toFixed(0)}€
                    </span>
                    <TrendingUp className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200/50">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs font-medium">Compte validé requis</p>
                  </div>
                )}
              </div>
            </>
          ) : details ? (
            <>
              <h3 className="font-bold text-base mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                Lot de lunettes
              </h3>
              <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                {details.description}
              </p>
              {isValidated ? (
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    {parseFloat(details.total_price).toFixed(0)}€
                  </span>
                  <Layers className="w-5 h-5 text-emerald-500 opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200/50">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-medium">Compte validé requis</p>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

// Vue liste avec design moderne
function ListingCardListView({ listing, isValidated }: { listing: any; isValidated: boolean }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-neutral-200/60 hover:border-primary/60 hover:shadow-glow-primary bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="p-0">
          <div className="flex gap-6">
            {/* Image */}
            <div className="relative w-64 h-44 flex-shrink-0 bg-gradient-to-br from-neutral-50 via-blue-50/30 to-orange-50/30 overflow-hidden">
              {listing.photo ? (
                <div className="relative w-full h-full">
                  <Image
                    src={listing.photo.photo_url}
                    alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="256px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isUnit ? (
                    <Package className="w-16 h-16 text-neutral-300 group-hover:text-primary/30 transition-colors" />
                  ) : (
                    <Layers className="w-16 h-16 text-neutral-300 group-hover:text-emerald-600/30 transition-colors" />
                  )}
                </div>
              )}

              <div className="absolute top-3 left-3 z-10">
                <Badge className={`text-xs font-semibold shadow-xl backdrop-blur-sm border-0 ${
                  isUnit
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                }`}>
                  {isUnit ? 'Unitaire' : 'Lot'}
                </Badge>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl group-hover:bg-primary transition-all duration-300 z-10">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold">{listing.views_count || 0}</span>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 py-6 pr-6">
              {isUnit && details ? (
                <div>
                  <div className="mb-3">
                    <p className="text-[10px] font-bold tracking-wider text-primary/60 mb-1 uppercase">Marque</p>
                    <h3 className="font-bold text-2xl group-hover:text-primary transition-colors">
                      {details.brand}
                    </h3>
                  </div>

                  {details.model && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold tracking-wider text-primary/60 mb-1 uppercase">Modèle</p>
                      <p className="font-semibold text-lg text-neutral-700">{details.model}</p>
                    </div>
                  )}

                  {details.reference && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold tracking-wider text-primary/60 mb-1 uppercase">Référence</p>
                      <p className="text-sm font-mono bg-gradient-to-r from-neutral-100 to-neutral-50 px-3 py-1.5 rounded-lg inline-block border border-neutral-200 font-semibold">
                        {details.reference}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 flex-wrap pt-4 border-t border-neutral-100">
                    {isValidated ? (
                      <>
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                          {parseFloat(details.price).toFixed(0)}€
                        </span>
                        {details.gender && (
                          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                            {details.gender}
                          </Badge>
                        )}
                        {details.category && (
                          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                            {details.category}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground bg-neutral-50 rounded-lg px-4 py-2 border border-neutral-200/50">
                        <Lock className="w-4 h-4" />
                        <p className="text-sm font-medium">Compte validé requis pour voir le prix</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : details ? (
                <div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-emerald-600 transition-colors">
                    Lot de lunettes
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                    {details.description}
                  </p>
                  {isValidated ? (
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                        {parseFloat(details.total_price).toFixed(0)}€
                      </span>
                      <Layers className="w-6 h-6 text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground bg-neutral-50 rounded-lg px-4 py-2 border border-neutral-200/50">
                      <Lock className="w-4 h-4" />
                      <p className="text-sm font-medium">Compte validé requis pour voir le prix</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

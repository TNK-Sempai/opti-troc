'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Layers, Eye, Lock, Clock } from 'lucide-react'

interface ListingCardProps {
  listing: any
  isValidated?: boolean
  showNew?: boolean
  variant?: 'grid' | 'list'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return `${diffDays}j`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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
      <Card className="group overflow-hidden h-full border border-light-grey shadow-card hover:shadow-forest hover:border-fern/40 transition-all duration-300 bg-off-white rounded-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-dust-grey overflow-hidden">
          {listing.photo ? (
            <Image
              src={listing.photo.photo_url}
              alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
              fill
              className="object-cover group-hover:scale-105 group-hover:brightness-105 transition-all duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-dust-grey">
              {isUnit ? (
                <Package className="w-10 h-10 text-dry-sage" />
              ) : (
                <Layers className="w-10 h-10 text-dry-sage" />
              )}
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2 z-10">
            <Badge className={`text-[10px] font-semibold border-0 px-1.5 py-0.5 ${
              isUnit ? 'bg-pine-teal text-white' : 'bg-fern text-white'
            }`}>
              {isUnit ? 'UNIT' : 'LOT'}
            </Badge>
          </div>

          {/* New badge */}
          {showNew && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="text-[10px] font-semibold bg-gold text-charcoal border-0 px-1.5 py-0.5">
                NEW
              </Badge>
            </div>
          )}

          {/* Stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 flex items-center justify-between">
            <span className="text-[10px] text-white/80 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.views_count || 0}
            </span>
            <span className="text-[10px] text-white/80 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(listing.created_at)}
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3">
          {isUnit && details ? (
            <>
              {/* Prix */}
              <div className="mb-1.5">
                {isValidated ? (
                  <span className="text-lg font-semibold text-gold font-mono">
                    {parseFloat(details.price).toFixed(0)}&euro;
                  </span>
                ) : (
                  <span className="text-sm text-medium-grey flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Prix masque
                  </span>
                )}
              </div>

              {/* Marque */}
              <h3 className="font-medium text-sm text-charcoal line-clamp-1 mb-0.5">
                {details.brand}
              </h3>

              {/* Modele */}
              {details.model && (
                <p className="text-xs text-medium-grey line-clamp-1">
                  {details.model}
                </p>
              )}
            </>
          ) : details ? (
            <>
              {/* Prix du lot */}
              <div className="mb-1.5">
                {isValidated ? (
                  <span className="text-lg font-semibold text-gold font-mono">
                    {parseFloat(details.total_price).toFixed(0)}&euro;
                  </span>
                ) : (
                  <span className="text-sm text-medium-grey flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Prix masque
                  </span>
                )}
              </div>

              <h3 className="font-medium text-sm text-charcoal line-clamp-1 mb-0.5">
                Lot de lunettes
              </h3>

              <p className="text-xs text-medium-grey line-clamp-1">
                {details.description}
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

// Vue liste
function ListingCardListView({ listing, isValidated }: { listing: any; isValidated: boolean }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="group overflow-hidden border border-light-grey shadow-card hover:shadow-forest hover:border-fern/40 transition-all duration-300 bg-off-white rounded-lg">
        <div className="flex">
          {/* Image */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-dust-grey overflow-hidden">
            {listing.photo ? (
              <Image
                src={listing.photo.photo_url}
                alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                fill
                className="object-cover group-hover:scale-105 group-hover:brightness-105 transition-all duration-500"
                sizes="160px"
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

            {/* Type badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`text-[10px] font-semibold border-0 ${
                isUnit ? 'bg-pine-teal text-white' : 'bg-fern text-white'
              }`}>
                {isUnit ? 'UNIT' : 'LOT'}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                {isUnit && details ? (
                  <>
                    <h3 className="font-medium text-base text-charcoal truncate">
                      {details.brand}
                    </h3>
                    {details.model && (
                      <p className="text-sm text-dark-grey truncate">
                        {details.model}
                      </p>
                    )}
                  </>
                ) : details ? (
                  <>
                    <h3 className="font-medium text-base text-charcoal">
                      Lot de lunettes
                    </h3>
                    <p className="text-sm text-dark-grey line-clamp-1">
                      {details.description}
                    </p>
                  </>
                ) : null}
              </div>

              {/* Prix */}
              <div className="shrink-0 text-right">
                {isValidated ? (
                  <span className="text-xl font-semibold text-gold font-mono">
                    {isUnit
                      ? parseFloat(details?.price || 0).toFixed(0)
                      : parseFloat(details?.total_price || 0).toFixed(0)}&euro;
                  </span>
                ) : (
                  <span className="text-sm text-medium-grey flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Masque
                  </span>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="mt-auto flex items-center gap-4 text-xs text-medium-grey">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {listing.views_count || 0} vues
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(listing.created_at)}
              </span>
              {isUnit && details?.reference && (
                <span className="font-mono text-dry-sage hidden sm:block">
                  {details.reference}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

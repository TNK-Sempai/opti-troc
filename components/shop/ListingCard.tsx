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
      <Card className="group overflow-hidden h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-xl">
        {/* Image - aspect ratio plus court */}
        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
          {listing.photo ? (
            <Image
              src={listing.photo.photo_url}
              alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
              {isUnit ? (
                <Package className="w-12 h-12 text-neutral-300" />
              ) : (
                <Layers className="w-12 h-12 text-neutral-300" />
              )}
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2 z-10">
            <Badge className={`text-[10px] font-bold border-0 shadow-sm px-1.5 py-0.5 ${
              isUnit ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isUnit ? 'UNIT' : 'LOT'}
            </Badge>
          </div>

          {/* New badge */}
          {showNew && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="text-[10px] font-bold bg-orange-500 text-white border-0 shadow-sm px-1.5 py-0.5">
                NEW
              </Badge>
            </div>
          )}

          {/* Stats overlay en bas */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-center justify-between">
            <span className="text-[10px] text-white/90 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.views_count || 0}
            </span>
            <span className="text-[10px] text-white/90 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(listing.created_at)}
            </span>
          </div>
        </div>

        {/* Content - compact */}
        <CardContent className="p-3">
          {isUnit && details ? (
            <>
              {/* Prix en premier */}
              <div className="mb-2">
                {isValidated ? (
                  <span className="text-xl font-black text-blue-600">
                    {parseFloat(details.price).toFixed(0)}€
                  </span>
                ) : (
                  <span className="text-sm text-neutral-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Prix masqué
                  </span>
                )}
              </div>

              {/* Marque */}
              <h3 className="font-bold text-sm text-neutral-900 line-clamp-1 mb-0.5">
                {details.brand}
              </h3>

              {/* Modèle */}
              {details.model && (
                <p className="text-xs text-neutral-500 line-clamp-1">
                  {details.model}
                </p>
              )}
            </>
          ) : details ? (
            <>
              {/* Prix du lot */}
              <div className="mb-2">
                {isValidated ? (
                  <span className="text-xl font-black text-emerald-600">
                    {parseFloat(details.total_price).toFixed(0)}€
                  </span>
                ) : (
                  <span className="text-sm text-neutral-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Prix masqué
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-neutral-900 line-clamp-1 mb-0.5">
                Lot de lunettes
              </h3>

              <p className="text-xs text-neutral-500 line-clamp-1">
                {details.description}
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

// Vue liste compacte
function ListingCardListView({ listing, isValidated }: { listing: any; isValidated: boolean }) {
  const isUnit = listing.listing_type === 'unit'
  const details = listing.details

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-xl">
        <div className="flex">
          {/* Image */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-neutral-100 overflow-hidden">
            {listing.photo ? (
              <Image
                src={listing.photo.photo_url}
                alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="160px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isUnit ? (
                  <Package className="w-10 h-10 text-neutral-300" />
                ) : (
                  <Layers className="w-10 h-10 text-neutral-300" />
                )}
              </div>
            )}

            {/* Type badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`text-[10px] font-bold border-0 shadow-sm ${
                isUnit ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
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
                    <h3 className="font-bold text-base text-neutral-900 truncate">
                      {details.brand}
                    </h3>
                    {details.model && (
                      <p className="text-sm text-neutral-600 truncate">
                        {details.model}
                      </p>
                    )}
                  </>
                ) : details ? (
                  <>
                    <h3 className="font-bold text-base text-neutral-900">
                      Lot de lunettes
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-1">
                      {details.description}
                    </p>
                  </>
                ) : null}
              </div>

              {/* Prix */}
              <div className="shrink-0 text-right">
                {isValidated ? (
                  <span className={`text-2xl font-black ${isUnit ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {isUnit
                      ? parseFloat(details?.price || 0).toFixed(0)
                      : parseFloat(details?.total_price || 0).toFixed(0)}€
                  </span>
                ) : (
                  <span className="text-sm text-neutral-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Masqué
                  </span>
                )}
              </div>
            </div>

            {/* Méta infos */}
            <div className="mt-auto flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {listing.views_count || 0} vues
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(listing.created_at)}
              </span>
              {isUnit && details?.reference && (
                <span className="font-mono text-neutral-400 hidden sm:block">
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

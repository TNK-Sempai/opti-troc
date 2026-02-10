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

const conditionLabels: Record<string, string> = {
  neuf_etiquette: 'Neuf',
  neuf_sans_etiquette: 'Comme neuf',
  tres_bon: 'Bon',
  bon: 'Correct'
}

const conditionColors: Record<string, string> = {
  neuf_etiquette: 'bg-fern/15 text-fern',
  neuf_sans_etiquette: 'bg-pine-teal/15 text-pine-teal',
  tres_bon: 'bg-gold/15 text-gold-hover',
  bon: 'bg-dust-grey text-dark-grey'
}

const categoryLabels: Record<string, string> = {
  vue: 'Vue',
  solaires: 'Solaires',
  sport: 'Sport'
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
              {/* Prix + badge condition */}
              <div className="flex items-center gap-2 mb-1.5">
                {isValidated ? (
                  <span className="text-lg font-semibold text-gold font-mono">
                    {parseFloat(details.price).toFixed(0)}&euro;
                  </span>
                ) : (
                  <span className="text-sm text-medium-grey flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Prix masqu&eacute;
                  </span>
                )}
                {details.state && conditionLabels[details.state] && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${conditionColors[details.state] || 'bg-dust-grey text-dark-grey'}`}>
                    {conditionLabels[details.state]}
                  </span>
                )}
              </div>

              {/* Marque + modèle */}
              <h3 className="text-sm text-charcoal line-clamp-1 mb-0.5">
                <span className="font-medium">{details.brand}</span>
                {details.model && <span className="text-medium-grey"> {details.model}</span>}
              </h3>

              {/* Référence */}
              {details.reference && (
                <p className="text-[10px] font-mono text-dry-sage line-clamp-1 mb-0.5">
                  {details.reference}
                </p>
              )}

              {/* Catégorie */}
              {details.category && categoryLabels[details.category] && (
                <span className="inline-block text-[10px] bg-dust-grey text-pine-teal px-1.5 py-0.5 rounded mt-0.5">
                  {categoryLabels[details.category]}
                </span>
              )}
            </>
          ) : details ? (
            <>
              {/* Prix lot + badge quantité */}
              <div className="flex items-center gap-2 mb-1.5">
                {isValidated ? (
                  <span className="text-lg font-semibold text-gold font-mono">
                    {parseFloat(details.total_price).toFixed(0)}&euro;
                  </span>
                ) : (
                  <span className="text-sm text-medium-grey flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Prix masqu&eacute;
                  </span>
                )}
                {details.quantity && (
                  <span className="text-[10px] font-semibold bg-fern/15 text-fern px-1.5 py-0.5 rounded">
                    {details.quantity} pcs
                  </span>
                )}
              </div>

              <h3 className="font-medium text-sm text-charcoal line-clamp-1 mb-0.5">
                Lot de lunettes
              </h3>

              {/* Prix unitaire */}
              {isValidated && details.quantity && details.total_price && (
                <p className="text-[10px] text-medium-grey mb-0.5">
                  ~{Math.round(parseFloat(details.total_price) / details.quantity)}&euro;/pi&egrave;ce
                </p>
              )}

              <p className="text-xs text-medium-grey line-clamp-2">
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
                    <h3 className="text-base text-charcoal truncate">
                      <span className="font-medium">{details.brand}</span>
                      {details.model && <span className="text-dark-grey"> {details.model}</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {details.state && conditionLabels[details.state] && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${conditionColors[details.state] || 'bg-dust-grey text-dark-grey'}`}>
                          {conditionLabels[details.state]}
                        </span>
                      )}
                      {details.category && categoryLabels[details.category] && (
                        <span className="text-[10px] bg-dust-grey text-pine-teal px-1.5 py-0.5 rounded">
                          {categoryLabels[details.category]}
                        </span>
                      )}
                    </div>
                  </>
                ) : details ? (
                  <>
                    <h3 className="font-medium text-base text-charcoal">
                      Lot de lunettes
                      {details.quantity && (
                        <span className="ml-2 text-[10px] font-semibold bg-fern/15 text-fern px-1.5 py-0.5 rounded align-middle">
                          {details.quantity} pcs
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-dark-grey line-clamp-1 mt-0.5">
                      {details.description}
                    </p>
                  </>
                ) : null}
              </div>

              {/* Prix */}
              <div className="shrink-0 text-right">
                {isValidated ? (
                  <>
                    <span className="text-xl font-semibold text-gold font-mono">
                      {isUnit
                        ? parseFloat(details?.price || 0).toFixed(0)
                        : parseFloat(details?.total_price || 0).toFixed(0)}&euro;
                    </span>
                    {!isUnit && details?.quantity && details?.total_price && (
                      <p className="text-[10px] text-medium-grey mt-0.5">
                        ~{Math.round(parseFloat(details.total_price) / details.quantity)}&euro;/pi&egrave;ce
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-medium-grey flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Masqu&eacute;
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
                <span className="font-mono text-[10px] text-dry-sage hidden sm:block">
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

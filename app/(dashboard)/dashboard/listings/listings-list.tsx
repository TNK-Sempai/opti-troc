'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Layers,
  Eye,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  PauseCircle,
  ShoppingBag,
  Clock,
  TrendingUp
} from 'lucide-react'
import { deleteListing } from './[id]/actions'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCondition(condition: string) {
  const conditions: Record<string, { label: string; color: string }> = {
    'new': { label: 'Neuf', color: 'bg-fern/10 text-fern' },
    'like_new': { label: 'Comme neuf', color: 'bg-pine-teal/10 text-pine-teal' },
    'good': { label: 'Bon état', color: 'bg-dry-sage/20 text-hunter-green' },
    'fair': { label: 'État correct', color: 'bg-gold/10 text-gold' },
  }
  return conditions[condition] || { label: condition, color: 'bg-dust-grey text-dark-grey' }
}

export default function ListingsList({ listings }: { listings: any[] }) {
  return (
    <div className="space-y-4">
      {listings.map((listing) => {
        const isUnit = listing.listing_type === 'unit'
        const details = listing.details
        const isActive = listing.status === 'active'
        const isSold = listing.status === 'sold'
        const condition = details?.condition ? formatCondition(details.condition) : null

        return (
          <Card
            key={listing.id}
            className={`overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-xl bg-white ${
              isSold ? 'opacity-70' : ''
            }`}
          >
            <div className="flex gap-0">
              {/* Image - Plus grande et carrée */}
              <div className="relative w-40 h-40 flex-shrink-0 bg-dust-grey overflow-hidden">
                {listing.photo ? (
                  <Image
                    src={listing.photo.photo_url}
                    alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="160px"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-dust-grey to-off-white">
                    {isUnit ? (
                      <Package className="w-12 h-12 text-medium-grey" />
                    ) : (
                      <Layers className="w-12 h-12 text-medium-grey" />
                    )}
                  </div>
                )}

                {/* Status overlay si vendu */}
                {isSold && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-pine-teal text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg transform -rotate-12">
                      VENDU
                    </div>
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={`text-[10px] font-bold border-0 shadow-sm ${
                    isUnit ? 'bg-pine-teal text-white' : 'bg-fern text-white'
                  }`}>
                    {isUnit ? 'UNITAIRE' : 'LOT'}
                  </Badge>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 p-5 flex flex-col min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Infos produit */}
                  <div className="flex-1 min-w-0">
                    {isUnit && details ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-charcoal truncate">
                            {details.brand}
                          </h3>
                          {condition && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${condition.color}`}>
                              {condition.label}
                            </span>
                          )}
                        </div>
                        {details.model && (
                          <p className="text-base text-dark-grey font-medium truncate mb-1">
                            {details.model}
                          </p>
                        )}
                        {details.reference && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono bg-dust-grey text-medium-grey px-2 py-0.5 rounded">
                            <span className="text-dry-sage">REF:</span>
                            {details.reference}
                          </span>
                        )}
                      </>
                    ) : details ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-charcoal">
                            Lot de lunettes
                          </h3>
                          {details.quantity && (
                            <span className="text-xs font-bold bg-fern/10 text-fern px-2 py-0.5 rounded-full">
                              {details.quantity} pièces
                            </span>
                          )}
                        </div>
                        <p className="text-base text-dark-grey line-clamp-1">
                          {details.description}
                        </p>
                      </>
                    ) : null}
                  </div>

                  {/* Prix */}
                  <div className="text-right flex-shrink-0">
                    {isUnit && details ? (
                      <p className="text-3xl font-black text-gold">
                        {parseFloat(details.price).toFixed(0)}€
                      </p>
                    ) : details ? (
                      <>
                        <p className="text-3xl font-black text-gold">
                          {parseFloat(details.total_price).toFixed(0)}€
                        </p>
                        {details.quantity && (
                          <p className="text-xs text-medium-grey mt-1">
                            ≈ {(parseFloat(details.total_price) / details.quantity).toFixed(0)}€/pièce
                          </p>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Métadonnées et actions */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {/* Status */}
                    {!isSold && (
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${
                        isActive ? 'text-fern' : 'text-gold'
                      }`}>
                        {isActive ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            En ligne
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-4 h-4" />
                            En pause
                          </>
                        )}
                      </span>
                    )}

                    {/* Vues */}
                    <span className="flex items-center gap-1.5 text-medium-grey">
                      <Eye className="w-4 h-4" />
                      {listing.views_count || 0} vues
                    </span>

                    {/* Date */}
                    <span className="flex items-center gap-1.5 text-medium-grey">
                      <Clock className="w-4 h-4" />
                      {formatDate(listing.created_at)}
                    </span>

                    {/* Infos supplémentaires pour unitaire */}
                    {isUnit && details && (
                      <>
                        {details.gender && (
                          <span className="text-dry-sage">
                            {details.gender === 'men' ? 'Homme' : details.gender === 'women' ? 'Femme' : 'Mixte'}
                          </span>
                        )}
                        {details.frame_type && (
                          <span className="text-dry-sage">
                            {details.frame_type === 'optical' ? 'Optique' : 'Solaire'}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <PremiumButton asChild size="sm" variant="outline" className="h-9 border-dry-sage">
                      <Link href={`/dashboard/listings/${listing.id}/edit`} className="inline-flex items-center gap-1.5">
                        <Edit className="w-3.5 h-3.5" />
                        Modifier
                      </Link>
                    </PremiumButton>

                    <PremiumButton asChild size="sm" gradient="primary" className="h-9">
                      <Link href={`/dashboard/listings/${listing.id}`} className="inline-flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Voir
                      </Link>
                    </PremiumButton>

                    <form action={deleteListing}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <PremiumButton
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </PremiumButton>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

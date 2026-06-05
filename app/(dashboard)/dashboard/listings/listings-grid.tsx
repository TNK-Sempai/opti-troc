'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Layers,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  PauseCircle,
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
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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

export default function ListingsGrid({ listings }: { listings: any[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {listings.map((listing) => {
        const isUnit = listing.listing_type === 'unit'
        const details = listing.details
        const isActive = listing.status === 'active'
        const isSold = listing.status === 'sold'
        const condition = details?.condition ? formatCondition(details.condition) : null

        return (
          <Card
            key={listing.id}
            className={`group overflow-hidden transition-all duration-300 h-full flex flex-col bg-white border-0 shadow-md hover:shadow-2xl ${
              !isActive && !isSold ? 'opacity-70' : ''
            } ${isSold ? 'grayscale-[30%]' : ''}`}
          >
            {/* Image Section - Style Leboncoin */}
            <div className="relative aspect-[4/3] bg-dust-grey overflow-hidden">
              {listing.photo ? (
                <Image
                  src={listing.photo.photo_url}
                  alt={isUnit && details ? `${details.brand} ${details.model}` : 'Lot'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-dust-grey to-off-white">
                  {isUnit ? (
                    <Package className="w-16 h-16 text-medium-grey mb-2" />
                  ) : (
                    <Layers className="w-16 h-16 text-medium-grey mb-2" />
                  )}
                  <span className="text-xs text-medium-grey font-medium">Pas de photo</span>
                </div>
              )}

              {/* Overlay gradient pour lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Status overlay si vendu */}
              {isSold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-pine-teal text-white px-6 py-2 rounded-full font-bold text-lg shadow-xl transform -rotate-12">
                    VENDU
                  </div>
                </div>
              )}

              {/* Type badge - coin supérieur gauche */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <Badge className={`text-[10px] font-bold border-0 shadow-md px-2 py-0.5 ${
                  isUnit
                    ? 'bg-pine-teal text-white'
                    : 'bg-fern text-white'
                }`}>
                  {isUnit ? 'UNITAIRE' : 'LOT'}
                </Badge>
              </div>

              {/* Status badge - coin supérieur droit */}
              {!isSold && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <Badge className={`text-[10px] font-bold border-0 shadow-md px-2 py-0.5 flex items-center gap-1 ${
                    isActive
                      ? 'bg-fern text-white'
                      : 'bg-gold text-charcoal'
                  }`}>
                    {isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        EN LIGNE
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3 h-3" />
                        PAUSE
                      </>
                    )}
                  </Badge>
                </div>
              )}

              {/* Stats en bas de l'image */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-md font-medium">
                  <Eye className="w-3 h-3" />
                  {listing.views_count || 0} vues
                </div>
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-md font-medium">
                  <Clock className="w-3 h-3" />
                  {formatDate(listing.created_at)}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-4 flex-1 flex flex-col">
              {isUnit && details ? (
                <>
                  {/* Prix en premier - très visible */}
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-2xl font-black text-gold">
                      {parseFloat(details.price).toFixed(0)}€
                    </span>
                    {condition && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${condition.color}`}>
                        {condition.label}
                      </span>
                    )}
                  </div>

                  {/* Marque - en gras */}
                  <h3 className="font-bold text-lg text-charcoal line-clamp-1 mb-1">
                    {details.brand}
                  </h3>

                  {/* Modèle - sous la marque */}
                  {details.model && (
                    <p className="text-sm text-dark-grey font-medium line-clamp-1 mb-2">
                      {details.model}
                    </p>
                  )}

                  {/* Référence - style tag */}
                  {details.reference && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-dust-grey text-dark-grey px-2 py-1 rounded">
                        <span className="text-dry-sage">REF:</span>
                        {details.reference}
                      </span>
                    </div>
                  )}

                  {/* Infos supplémentaires */}
                  <div className="mt-auto pt-3 border-t border-light-grey flex items-center gap-3 text-xs text-medium-grey">
                    {details.gender && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-dry-sage"></span>
                        {details.gender === 'men' ? 'Homme' : details.gender === 'women' ? 'Femme' : 'Mixte'}
                      </span>
                    )}
                    {details.frame_type && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-dry-sage"></span>
                        {details.frame_type === 'optical' ? 'Optique' : 'Solaire'}
                      </span>
                    )}
                  </div>
                </>
              ) : details ? (
                <>
                  {/* Prix du lot */}
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-2xl font-black text-gold">
                      {parseFloat(details.total_price).toFixed(0)}€
                    </span>
                    {details.quantity && (
                      <span className="text-xs font-bold bg-fern/10 text-fern px-2 py-0.5 rounded-full">
                        {details.quantity} pièces
                      </span>
                    )}
                  </div>

                  {/* Titre du lot */}
                  <h3 className="font-bold text-lg text-charcoal line-clamp-1 mb-2">
                    Lot de lunettes
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-dark-grey line-clamp-2 mb-3 flex-1">
                    {details.description}
                  </p>

                  {/* Prix unitaire calculé */}
                  {details.quantity && details.total_price && (
                    <div className="mt-auto pt-3 border-t border-light-grey">
                      <span className="text-xs text-medium-grey">
                        ≈ {(parseFloat(details.total_price) / details.quantity).toFixed(0)}€ / pièce
                      </span>
                    </div>
                  )}
                </>
              ) : null}

              {/* Actions - Style compact */}
              <div className="mt-4 flex gap-2">
                <PremiumButton asChild size="sm" gradient="primary" className="flex-1 h-9">
                  <Link href={`/dashboard/listings/${listing.id}`} className="inline-flex items-center justify-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Voir</span>
                  </Link>
                </PremiumButton>

                <PremiumButton asChild size="sm" variant="outline" className="h-9 px-3 border-dry-sage">
                  <Link href={`/dashboard/listings/${listing.id}/edit`} className="inline-flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5" />
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

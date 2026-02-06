'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Eye, MapPin, Clock, Tag, Building2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductCardModernProps {
  id: string
  title: string
  price: number
  images: string[]
  condition: string
  category: string
  location?: string
  companyName?: string
  createdAt: string
  viewMode?: 'grid' | 'list'
  index?: number
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'Neuf', color: 'bg-fern' },
  like_new: { label: 'Comme neuf', color: 'bg-hunter-green' },
  very_good: { label: 'Très bon', color: 'bg-pine-teal' },
  good: { label: 'Bon', color: 'bg-dry-sage text-pine-teal' },
  fair: { label: 'Correct', color: 'bg-gold text-pine-teal' },
}

const categoryLabels: Record<string, string> = {
  frames: 'Montures',
  lenses: 'Verres',
  sunglasses: 'Solaires',
  contact_lenses: 'Lentilles',
  equipment: 'Équipement',
  accessories: 'Accessoires',
  consumables: 'Consommables',
  other: 'Autre',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function ProductCardModern({
  id,
  title,
  price,
  images,
  condition,
  category,
  location,
  companyName,
  createdAt,
  viewMode = 'grid',
  index = 0,
}: ProductCardModernProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const conditionInfo = conditionLabels[condition] || { label: condition, color: 'bg-medium-grey' }
  const categoryLabel = categoryLabels[category] || category

  // Grid View
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setCurrentImageIndex(0)
        }}
      >
        <Link href={`/listing/${id}`}>
          <div className="bg-off-white rounded-2xl overflow-hidden shadow-card hover:shadow-forest hover:border-fern/30 transition-all duration-300 hover:-translate-y-2 border border-transparent">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-dust-grey">
              {images.length > 0 ? (
                <Image
                  src={images[currentImageIndex] || images[0]}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dry-sage">
                  <Tag className="w-12 h-12" />
                </div>
              )}

              {/* Image dots navigation */}
              {images.length > 1 && isHovered && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onMouseEnter={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        currentImageIndex === idx
                          ? 'bg-white w-4'
                          : 'bg-white/60 hover:bg-white/80'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <Badge className={cn('text-white text-xs font-medium', conditionInfo.color)}>
                  {conditionInfo.label}
                </Badge>
              </div>

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsFavorite(!isFavorite)
                }}
                className={cn(
                  'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-dark-grey hover:text-red-500'
                )}
              >
                <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
              </button>

              {/* Quick view overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4"
              >
                <Button
                  size="sm"
                  className="bg-gold text-charcoal hover:bg-gold-hover gap-2 font-semibold"
                >
                  <Eye className="w-4 h-4" />
                  Voir détails
                </Button>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Category */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-pine-teal bg-pine-teal/10 px-2 py-0.5 rounded-full">
                  {categoryLabel}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif font-semibold text-charcoal line-clamp-2 mb-2 group-hover:text-pine-teal transition-colors">
                {title}
              </h3>

              {/* Price */}
              <p className="text-xl font-bold text-gold mb-3">
                {formatPrice(price)}
              </p>

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-medium-grey pt-3 border-t border-light-grey">
                {companyName && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">{companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // List View
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="group"
    >
      <Link href={`/listing/${id}`}>
        <div className="bg-off-white rounded-xl overflow-hidden shadow-card hover:shadow-forest hover:border-fern/30 transition-all duration-300 flex border border-transparent">
          {/* Image */}
          <div className="relative w-48 md:w-64 flex-shrink-0 overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="256px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-dust-grey text-dry-sage">
                <Tag className="w-10 h-10" />
              </div>
            )}

            {/* Condition badge */}
            <Badge className={cn('absolute top-3 left-3 text-white text-xs', conditionInfo.color)}>
              {conditionInfo.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-xs font-medium text-pine-teal bg-pine-teal/10 px-2 py-0.5 rounded-full">
                    {categoryLabel}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setIsFavorite(!isFavorite)
                  }}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-dust-grey text-medium-grey hover:text-red-500 hover:bg-red-50'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                </button>
              </div>

              {/* Title */}
              <h3 className="font-serif font-semibold text-lg text-charcoal line-clamp-2 mb-2 group-hover:text-pine-teal transition-colors">
                {title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-medium-grey">
                {companyName && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{companyName}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-light-grey">
              <p className="text-2xl font-bold text-gold">
                {formatPrice(price)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-pine-teal hover:text-pine-teal hover:bg-pine-teal/10 gap-1"
              >
                Voir détails
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

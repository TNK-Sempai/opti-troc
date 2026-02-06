'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCardModern } from './product-card-modern'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  condition: string
  category: string
  companyName?: string
  createdAt: string
}

interface ProductCarouselProps {
  products: Product[]
  title: string
  subtitle?: string
  itemsToShow?: 5 | 10
  className?: string
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  itemsToShow = 5,
  className,
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [showCount, setShowCount] = useState<5 | 10>(itemsToShow)

  const displayedProducts = products.slice(0, showCount)

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className={cn('relative', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-serif font-bold text-pine-teal"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-medium-grey mt-1"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Toggle 5/10 */}
          <div className="flex items-center bg-dust-grey rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCount(5)}
              className={cn(
                'h-8 px-3 text-sm font-medium rounded-md transition-all',
                showCount === 5
                  ? 'bg-white shadow-sm text-pine-teal'
                  : 'text-medium-grey hover:text-charcoal'
              )}
            >
              5
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCount(10)}
              className={cn(
                'h-8 px-3 text-sm font-medium rounded-md transition-all',
                showCount === 10
                  ? 'bg-white shadow-sm text-pine-teal'
                  : 'text-medium-grey hover:text-charcoal'
              )}
            >
              10
            </Button>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="h-9 w-9 rounded-full border-light-grey"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="h-9 w-9 rounded-full border-light-grey"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative -mx-4 px-4">
        {/* Gradient overlays */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-off-white to-transparent z-10 pointer-events-none transition-opacity',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-off-white to-transparent z-10 pointer-events-none transition-opacity',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
            >
              <ProductCardModern
                {...product}
                viewMode="grid"
                index={index}
              />
            </div>
          ))}

          {displayedProducts.length === 0 && (
            <div className="flex-1 py-12 text-center text-medium-grey">
              Aucun produit disponible
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, List, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ShopControlsProps {
  totalResults: number
  currentPage: number
  totalPages: number
  pageSize: number
  viewMode: 'grid' | 'list'
  startItem: number
  endItem: number
}

export function ShopControls({
  totalResults,
  currentPage,
  totalPages,
  pageSize,
  viewMode,
  startItem,
  endItem,
}: ShopControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.push(`/shop?${params.toString()}`)
  }

  const handleViewChange = (mode: 'grid' | 'list') => {
    updateParams({ view: mode })
  }

  const handlePageSizeChange = (size: string) => {
    updateParams({ pageSize: size, page: '1' })
  }

  const handleSortChange = (sort: string) => {
    updateParams({ sort, page: '1' })
  }

  const currentSort = searchParams.get('sort') || 'recent'

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Gauche: Toggle vue + Items par page */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Toggle Grid/List */}
        <div className="flex items-center bg-dust-grey rounded-xl p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('grid')}
            className={cn(
              'h-9 w-9 p-0 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-white shadow-md text-pine-teal'
                : 'text-medium-grey hover:text-pine-teal hover:bg-white/50'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('list')}
            className={cn(
              'h-9 w-9 p-0 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-white shadow-md text-pine-teal'
                : 'text-medium-grey hover:text-pine-teal hover:bg-white/50'
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-medium-grey font-medium">Afficher</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20 h-9 text-sm border-light-grey focus:ring-pine-teal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tri */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-medium-grey font-medium hidden sm:inline">Trier par</span>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40 h-9 text-sm border-light-grey focus:ring-pine-teal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="views">Plus consultés</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Droite: Info résultats */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-dark-grey font-medium">
          <span className="font-bold text-pine-teal">{startItem}-{endItem}</span>
          {' '}sur{' '}
          <span className="font-bold text-pine-teal">{totalResults}</span>
          {' '}résultats
        </span>
      </div>
    </div>
  )
}

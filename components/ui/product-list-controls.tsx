'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ProductListControlsProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  itemsPerPage: number
  onItemsPerPageChange: (count: number) => void
  totalItems: number
  currentPage: number
  onPageChange: (page: number) => void
  itemsPerPageOptions?: number[]
  className?: string
}

export function ProductListControls({
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPageOptions = [25, 50, 100],
  className,
}: ProductListControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4', className)}>
      {/* Gauche: Toggle vue + Items par page */}
      <div className="flex items-center gap-3">
        {/* Toggle Grid/List */}
        <div className="flex items-center bg-dust-grey rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'h-8 w-8 p-0 rounded-md transition-all',
              viewMode === 'grid'
                ? 'bg-white shadow-sm text-primary'
                : 'text-medium-grey hover:text-dark-grey'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'h-8 w-8 p-0 rounded-md transition-all',
              viewMode === 'list'
                ? 'bg-white shadow-sm text-primary'
                : 'text-medium-grey hover:text-dark-grey'
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-medium-grey hidden sm:inline">Afficher</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              onItemsPerPageChange(Number(value))
              onPageChange(1) // Reset to page 1 when changing items per page
            }}
          >
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-medium-grey hidden sm:inline">par page</span>
        </div>
      </div>

      {/* Droite: Info + Pagination */}
      <div className="flex items-center gap-4">
        {/* Info résultats */}
        <span className="text-sm text-medium-grey">
          {startItem}-{endItem} sur {totalItems}
        </span>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2"
            >
              Précédent
            </Button>

            {/* Pages */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      'h-8 w-8 p-0',
                      currentPage === pageNum && 'bg-primary text-white'
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-2"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Grid3x3, List, ArrowUpDown } from 'lucide-react'

interface ViewControlsProps {
  totalResults: number
}

export function ViewControls({ totalResults }: ViewControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  )

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    router.push(`/shop?${params.toString()}`)
  }

  function handleViewChange(newView: 'grid' | 'list') {
    setView(newView)
    const params = new URLSearchParams(searchParams)
    params.set('view', newView)
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">{totalResults}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-900">
            {totalResults} annonce{totalResults > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-muted-foreground">trouvée{totalResults > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Vue Toggle */}
        <div className="flex items-center gap-1 border-2 border-blue-200 rounded-xl p-1 bg-blue-50/50 shadow-sm">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className={view === 'grid'
              ? "h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              : "h-9 px-4 hover:bg-blue-100 hover:text-blue-700 transition-all duration-300"
            }
            onClick={() => handleViewChange('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={view === 'list'
              ? "h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              : "h-9 px-4 hover:bg-blue-100 hover:text-blue-700 transition-all duration-300"
            }
            onClick={() => handleViewChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Tri */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl px-3 py-1.5 shadow-sm">
          <ArrowUpDown className="w-4 h-4 text-orange-600" />
          <Select
            defaultValue={searchParams.get('sort') || 'recent'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="h-9 w-[160px] border-0 bg-transparent font-semibold text-orange-900 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récent</SelectItem>
              <SelectItem value="views">Plus consultés</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

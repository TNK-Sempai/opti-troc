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
      <p className="text-sm text-muted-foreground">
        {totalResults} annonce{totalResults > 1 ? 's' : ''} trouvée{totalResults > 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-3">
        {/* Vue Toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => handleViewChange('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => handleViewChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Tri */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select
            defaultValue={searchParams.get('sort') || 'recent'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="h-9 w-[160px]">
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

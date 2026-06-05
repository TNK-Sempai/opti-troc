'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Search, SlidersHorizontal } from 'lucide-react'

interface MarketplaceFiltersProps {
  brands: string[]
  models: Record<string, string[]>
}

function FilterForm({
  brands,
  models,
  onSubmit,
  onReset,
}: {
  brands: string[]
  models: Record<string, string[]>
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onReset: () => void
}) {
  const searchParams = useSearchParams()
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all')
  const availableModels = useMemo(() => {
    if (selectedBrand && selectedBrand !== 'all' && models[selectedBrand]) {
      return models[selectedBrand]
    }
    return []
  }, [selectedBrand, models])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Recherche */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Recherche
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fern" />
          <Input
            name="search"
            placeholder="Marque, modele..."
            defaultValue={searchParams.get('search') || ''}
            className="pl-10 h-10 border-light-grey bg-off-white"
          />
        </div>
      </div>

      <Separator className="bg-light-grey" />

      {/* Type */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Type
        </Label>
        <Select name="type" defaultValue={searchParams.get('type') || 'all'}>
          <SelectTrigger className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="unit">Unitaire</SelectItem>
            <SelectItem value="lot">Lot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Marque */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Marque
        </Label>
        <Select
          name="brand"
          value={selectedBrand}
          onValueChange={setSelectedBrand}
        >
          <SelectTrigger className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            <SelectItem value="all">Toutes</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modele */}
      {availableModels.length > 0 && (
        <div>
          <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
            Modele
          </Label>
          <Select name="model" defaultValue={searchParams.get('model') || 'all'}>
            <SelectTrigger className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="all">Tous</SelectItem>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator className="bg-light-grey" />

      {/* Genre */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Genre
        </Label>
        <Select name="gender" defaultValue={searchParams.get('gender') || 'all'}>
          <SelectTrigger className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="homme">Homme</SelectItem>
            <SelectItem value="femme">Femme</SelectItem>
            <SelectItem value="mixte">Mixte</SelectItem>
            <SelectItem value="enfant">Enfant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categorie */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Categorie
        </Label>
        <Select name="category" defaultValue={searchParams.get('category') || 'all'}>
          <SelectTrigger className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="vue">Vue</SelectItem>
            <SelectItem value="solaires">Solaires</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Etat */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Etat
        </Label>
        <Select name="state" defaultValue={searchParams.get('state') || 'all'}>
          <SelectTrigger className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="neuf_etiquette">Neuf etiquette</SelectItem>
            <SelectItem value="neuf_sans_etiquette">Neuf</SelectItem>
            <SelectItem value="tres_bon">Tres bon</SelectItem>
            <SelectItem value="bon">Bon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-light-grey" />

      {/* Prix */}
      <div>
        <Label className="text-xs font-semibold text-dark-grey uppercase mb-2 block tracking-wider">
          Prix (EUR)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="minPrice"
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get('minPrice') || ''}
            className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5"
          />
          <Input
            name="maxPrice"
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get('maxPrice') || ''}
            className="h-10 border-light-grey bg-off-white focus:border-fern focus:ring-fern/20 hover:bg-pine-teal/5"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="space-y-2 pt-4">
        <Button type="submit" className="w-full h-11 bg-pine-teal hover:bg-hunter-green text-white font-medium">
          Appliquer
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 border-light-grey"
          onClick={onReset}
        >
          Reinitialiser
        </Button>
      </div>
    </form>
  )
}

export function MarketplaceFilters({ brands, models }: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = [
    searchParams.get('search'),
    searchParams.get('type') && searchParams.get('type') !== 'all',
    searchParams.get('brand') && searchParams.get('brand') !== 'all',
    searchParams.get('model') && searchParams.get('model') !== 'all',
    searchParams.get('gender') && searchParams.get('gender') !== 'all',
    searchParams.get('category') && searchParams.get('category') !== 'all',
    searchParams.get('state') && searchParams.get('state') !== 'all',
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
  ].filter(Boolean).length

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    formData.forEach((value, key) => {
      if (value && value !== 'all') {
        params.set(key, value.toString())
      }
    })

    router.push(`/shop?${params.toString()}`)
    setIsOpen(false)
  }

  function handleReset() {
    router.push('/shop')
    setIsOpen(false)
  }

  return (
    <>
      {/* Version Mobile */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full h-12 justify-between border-light-grey">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-pine-teal text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto bg-off-white">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filtres
              </SheetTitle>
            </SheetHeader>
            <FilterForm
              brands={brands}
              models={models}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Version Desktop */}
      <div className="hidden lg:block">
        <Card className="border border-light-grey bg-off-white rounded-lg overflow-hidden">
          <div className="bg-pine-teal p-4">
            <div className="flex items-center gap-2 text-white">
              <SlidersHorizontal className="w-4 h-4" />
              <h2 className="font-semibold text-sm">Filtres</h2>
              {activeFiltersCount > 0 && (
                <span className="bg-gold text-charcoal text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">
                  {activeFiltersCount}
                </span>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <FilterForm
              brands={brands}
              models={models}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

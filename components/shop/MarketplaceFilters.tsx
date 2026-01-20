'use client'

import { useState, useEffect } from 'react'
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
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface MarketplaceFiltersProps {
  brands: string[]
  models: Record<string, string[]>
}

// Composant de filtres réutilisable
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
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (selectedBrand && selectedBrand !== 'all' && models[selectedBrand]) {
      setAvailableModels(models[selectedBrand])
    } else {
      setAvailableModels([])
    }
  }, [selectedBrand, models])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Recherche */}
      <div>
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          Recherche
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            name="search"
            placeholder="Marque, modèle..."
            defaultValue={searchParams.get('search') || ''}
            className="pl-10 h-10"
          />
        </div>
      </div>

      <Separator />

      {/* Type */}
      <div>
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          Type
        </Label>
        <Select name="type" defaultValue={searchParams.get('type') || 'all'}>
          <SelectTrigger className="h-10">
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
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          Marque
        </Label>
        <Select
          name="brand"
          value={selectedBrand}
          onValueChange={setSelectedBrand}
        >
          <SelectTrigger className="h-10">
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

      {/* Modèle */}
      {availableModels.length > 0 && (
        <div>
          <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
            Modèle
          </Label>
          <Select name="model" defaultValue={searchParams.get('model') || 'all'}>
            <SelectTrigger className="h-10">
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

      <Separator />

      {/* Genre */}
      <div>
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          Genre
        </Label>
        <Select name="gender" defaultValue={searchParams.get('gender') || 'all'}>
          <SelectTrigger className="h-10">
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

      {/* Catégorie */}
      <div>
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          Catégorie
        </Label>
        <Select name="category" defaultValue={searchParams.get('category') || 'all'}>
          <SelectTrigger className="h-10">
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

      {/* État */}
      <div>
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          État
        </Label>
        <Select name="state" defaultValue={searchParams.get('state') || 'all'}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="neuf_etiquette">Neuf étiquette</SelectItem>
            <SelectItem value="neuf_sans_etiquette">Neuf</SelectItem>
            <SelectItem value="tres_bon">Très bon</SelectItem>
            <SelectItem value="bon">Bon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Prix */}
      <div>
        <Label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
          Prix (€)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="minPrice"
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get('minPrice') || ''}
            className="h-10"
          />
          <Input
            name="maxPrice"
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get('maxPrice') || ''}
            className="h-10"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="space-y-2 pt-4">
        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold">
          Appliquer
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full h-10"
          onClick={onReset}
        >
          Réinitialiser
        </Button>
      </div>
    </form>
  )
}

export function MarketplaceFilters({ brands, models }: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  // Compter les filtres actifs
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
      {/* Version Mobile - Bouton qui ouvre un Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full h-12 justify-between border-2">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
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

      {/* Version Desktop - Sidebar */}
      <div className="hidden lg:block">
        <Card className="border-0 shadow-md overflow-hidden bg-white rounded-xl">
          <div className="bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-white">
              <SlidersHorizontal className="w-5 h-5" />
              <h2 className="font-bold">Filtres</h2>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
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

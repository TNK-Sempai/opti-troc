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
import { Separator } from '@/components/ui/separator'
import { Search, SlidersHorizontal } from 'lucide-react'

interface MarketplaceFiltersProps {
  brands: string[]
  models: Record<string, string[]>
}

export function MarketplaceFilters({ brands, models }: MarketplaceFiltersProps) {
  const router = useRouter()
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    // Ajouter tous les paramètres non vides
    formData.forEach((value, key) => {
      if (value && value !== 'all') {
        params.set(key, value.toString())
      }
    })

    router.push(`/shop?${params.toString()}`)
  }

  return (
    <Card className="border-blue-200/60 shadow-xl overflow-hidden backdrop-blur-sm bg-white/95 sticky top-20">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-5 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
        </div>

        <div className="flex items-center gap-3 text-white relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg">Filtres</h2>
        </div>
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recherche */}
          <div>
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Recherche
            </Label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
              <Input
                name="search"
                placeholder="Marque, modèle..."
                defaultValue={searchParams.get('search') || ''}
                className="pl-10 h-11 border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
              />
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

          {/* Type */}
          <div>
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Type
            </Label>
            <Select name="type" defaultValue={searchParams.get('type') || 'all'}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="unit">📦 Unitaire</SelectItem>
                <SelectItem value="lot">📚 Lot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marque - Dynamique */}
          <div>
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Marque
            </Label>
            <Select
              name="brand"
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Toutes les marques</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modèle - Dynamique basé sur la marque */}
          {availableModels.length > 0 && (
            <div>
              <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Modèle
              </Label>
              <Select name="model" defaultValue={searchParams.get('model') || 'all'}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Tous les modèles" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Tous les modèles</SelectItem>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

          {/* Genre */}
          <div>
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
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
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
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
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
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

          <Separator className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

          {/* Prix */}
          <div>
            <Label className="text-xs font-bold text-blue-700 uppercase mb-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Prix (€)
            </Label>
            <div className="space-y-2">
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
          <div className="space-y-3 pt-4">
            <Button type="submit" className="w-full h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold text-base">
              Appliquer les filtres
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
              onClick={() => router.push('/shop')}
            >
              Réinitialiser tout
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

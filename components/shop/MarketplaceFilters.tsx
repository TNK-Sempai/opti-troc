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
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="font-semibold">Filtres</h2>
        </div>
      </div>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recherche */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Recherche
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Rechercher..."
                defaultValue={searchParams.get('search') || ''}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <Separator />

          {/* Type */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
              <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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

          <Separator />

          {/* Genre */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2">
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
          <div className="space-y-2 pt-2">
            <Button type="submit" className="w-full h-10 shadow-md">
              Appliquer
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={() => router.push('/shop')}
            >
              Réinitialiser
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

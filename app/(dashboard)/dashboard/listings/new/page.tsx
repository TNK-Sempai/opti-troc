'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Package, Layers, Loader2 } from 'lucide-react'
import UnitListingForm from './unit-form'
import LotListingForm from './lot-form'

export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [selectedType, setSelectedType] = useState<'unit' | 'lot' | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [canCreate, setCanCreate] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()


    if (profile?.status === 'validated' || profile?.role === 'admin') {
      setCanCreate(true)
    } else {
      setCanCreate(false)
    }

    setIsChecking(false)
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pine-teal" />
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Compte non validé</CardTitle>
            <CardDescription>
              Votre compte doit être validé par un administrateur avant de pouvoir créer des annonces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-dark-grey mb-4">
              Un email vous sera envoyé dès que votre compte sera validé.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedType === 'unit') {
    return <UnitListingForm onBack={() => setSelectedType(null)} />
  }

  if (selectedType === 'lot') {
    return <LotListingForm onBack={() => setSelectedType(null)} />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Link>
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-pine-teal mb-2">
          Créer une annonce
        </h1>
        <p className="text-dark-grey">
          Choisissez le type d'annonce que vous souhaitez créer
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Annonce unitaire */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedType('unit')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-pine-teal/10 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-pine-teal" />
            </div>
            <CardTitle>Vente unitaire</CardTitle>
            <CardDescription>
              Vendre une monture, une paire de lunettes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-dark-grey mb-6">
              <li className="flex items-start gap-2">
                <span className="text-pine-teal">✓</span>
                <span>Formulaire guidé avec auto-complétion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pine-teal">✓</span>
                <span>Détails précis du produit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pine-teal">✓</span>
                <span>Prix fixe</span>
              </li>
            </ul>
            <Button className="w-full">
              Créer une annonce unitaire
            </Button>
          </CardContent>
        </Card>

        {/* Annonce lot */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedType('lot')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-fern/10 rounded-full flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-fern" />
            </div>
            <CardTitle>Vente par lot</CardTitle>
            <CardDescription>
              Vendre plusieurs montures en lot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-dark-grey mb-6">
              <li className="flex items-start gap-2">
                <span className="text-fern">✓</span>
                <span>Plusieurs articles dans une annonce</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fern">✓</span>
                <span>Prix global ou vente partielle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fern">✓</span>
                <span>Idéal pour déstockage</span>
              </li>
            </ul>
            <Button className="w-full bg-fern hover:bg-hunter-green">
              Créer une annonce lot
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
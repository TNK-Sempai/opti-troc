import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Layers } from 'lucide-react'
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate'
import { ListingTypePicker } from './listing-type-picker'

export default async function NewListingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // supabaseAdmin (service role) et non le client navigateur : le contrôle
  // d'accès ne doit pas dépendre des policies RLS, comme dans le layout
  // dashboard, le middleware et les pages marketplace.
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('status, role, subscription_status')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isValidated = profile?.status === 'validated'
  const hasActiveSub = profile?.subscription_status === 'active'

  const canCreate = isAdmin || isValidated
  const subscriptionActive = isAdmin || hasActiveSub

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

  if (!subscriptionActive) {
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
        <SubscriptionGate isActive={false} featureName="la création d'annonces">
          <div className="grid md:grid-cols-2 gap-6 opacity-50 pointer-events-none select-none">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-pine-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-pine-teal" />
                </div>
                <CardTitle>Vente unitaire</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-fern/10 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-8 h-8 text-fern" />
                </div>
                <CardTitle>Vente par lot</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </SubscriptionGate>
      </div>
    )
  }

  return <ListingTypePicker />
}

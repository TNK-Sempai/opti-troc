import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, User, Building2, MapPin, Mail, Phone, FileText, Calendar, CheckCircle, XCircle, Ban } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: userProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!userProfile) notFound()

  const statusConfig = {
    validated: { label: 'Validé', color: 'bg-green-600' },
    pending: { label: 'En attente', color: 'bg-yellow-600' },
    incomplete: { label: 'Incomplet', color: 'bg-neutral-400' },
    rejected: { label: 'Rejeté', color: 'bg-red-600' },
    suspended: { label: 'Suspendu', color: 'bg-orange-600' },
  }
  const currentStatus = statusConfig[userProfile.status as keyof typeof statusConfig] || statusConfig.incomplete

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {userProfile.first_name} {userProfile.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">Gestion utilisateur</p>
          </div>
        </div>
        <Badge className={`${currentStatus.color} text-white`}>
          {currentStatus.label}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prénom</p>
                  <p className="font-semibold">{userProfile.first_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nom</p>
                  <p className="font-semibold">{userProfile.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm">{userProfile.email}</p>
                </div>
                {userProfile.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                    <p className="text-sm">{userProfile.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entreprise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nom de l'entreprise</p>
                  <p className="font-semibold">{userProfile.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">N° TVA</p>
                  <p className="text-sm font-mono">{userProfile.vat_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Adresse</p>
                  <p className="text-sm">{userProfile.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ville</p>
                  <p className="text-sm">{userProfile.city}, {userProfile.postal_code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pays</p>
                  <p className="text-sm">{userProfile.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {userProfile.status === 'pending' && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-sm">Actions de validation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valider
                  </Button>
                  <Button variant="outline" className="text-red-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Inscription</p>
                <p className="text-sm">
                  {new Date(userProfile.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {userProfile.is_early_adopter && (
                <div>
                  <Badge className="bg-warning/10 text-warning border-warning/30">
                    🎉 Early Adopter
                  </Badge>
                </div>
              )}
              {userProfile.role === 'admin' && (
                <div>
                  <Badge variant="outline">Administrateur</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userProfile.status === 'validated' && (
                <Button variant="outline" size="sm" className="w-full text-orange-600">
                  <Ban className="w-4 h-4 mr-2" />
                  Suspendre
                </Button>
              )}
              {userProfile.status === 'suspended' && (
                <Button variant="outline" size="sm" className="w-full text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Réactiver
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
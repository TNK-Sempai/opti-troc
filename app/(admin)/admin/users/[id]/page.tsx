import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserActionButtons } from '@/components/admin/user-action-buttons'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
    validated: { label: 'Validé', color: 'bg-fern' },
    pending: { label: 'En attente', color: 'bg-yellow-600' },
    incomplete: { label: 'Incomplet', color: 'bg-medium-grey' },
    rejected: { label: 'Rejeté', color: 'bg-red-600' },
    suspended: { label: 'Suspendu', color: 'bg-orange-600' },
  }
  const currentStatus = statusConfig[userProfile.status as keyof typeof statusConfig] || statusConfig.incomplete

  return (
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-5xl relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hover:bg-white/80 hover:shadow-md transition-all duration-300 border border-light-grey">
              <Link href="/admin/users">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                <span className="text-forest-gradient drop-shadow-sm">
                  {userProfile.first_name} {userProfile.last_name}
                </span>
              </h1>
              <p className="text-base text-muted-foreground font-medium">Gestion utilisateur</p>
            </div>
          </div>
          <Badge className={`${currentStatus.color} text-white font-bold text-base px-4 py-2 rounded-xl shadow-lg`}>
            {currentStatus.label}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-pine-teal to-hunter-green p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-xl font-bold relative">Informations personnelles</CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-xs text-pine-teal font-bold uppercase tracking-wide">Prénom</p>
                    <p className="font-bold text-lg">{userProfile.first_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-pine-teal font-bold uppercase tracking-wide">Nom</p>
                    <p className="font-bold text-lg">{userProfile.last_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-pine-teal font-bold uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium">{userProfile.email}</p>
                  </div>
                  {userProfile.phone && (
                    <div className="space-y-1">
                      <p className="text-xs text-pine-teal font-bold uppercase tracking-wide">Téléphone</p>
                      <p className="text-sm font-medium">{userProfile.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-fern to-hunter-green p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-xl font-bold relative">Entreprise</CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-xs text-fern font-bold uppercase tracking-wide">Nom de l'entreprise</p>
                    <p className="font-bold text-lg">{userProfile.company_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-fern font-bold uppercase tracking-wide">N° TVA</p>
                    <p className="text-sm font-mono font-bold">{userProfile.vat_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-fern font-bold uppercase tracking-wide">Adresse</p>
                    <p className="text-sm font-medium">{userProfile.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-fern font-bold uppercase tracking-wide">Ville</p>
                    <p className="text-sm font-medium">{userProfile.city}, {userProfile.postal_code}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-fern font-bold uppercase tracking-wide">Pays</p>
                    <p className="text-sm font-medium">{userProfile.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userProfile.status === 'pending' && (
              <Card className="border-2 border-gold/40 bg-gold/5 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-pine-teal">Actions de validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserActionButtons userId={userProfile.id} status={userProfile.status} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl border-light-grey backdrop-blur-sm bg-off-white overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-charcoal to-dark-grey p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-lg font-bold relative">Informations</CardTitle>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-medium-grey font-bold uppercase tracking-wide">Inscription</p>
                  <p className="text-sm font-semibold">
                    {new Date(userProfile.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {userProfile.is_early_adopter && (
                  <div>
                    <Badge className="bg-gold text-white border-0 shadow-lg font-bold text-sm px-3 py-1.5">
                      🎉 Early Adopter
                    </Badge>
                  </div>
                )}
                {userProfile.role === 'admin' && (
                  <div>
                    <Badge className="bg-pine-teal text-white border-0 shadow-lg font-bold text-sm px-3 py-1.5">
                      Administrateur
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-pine-teal to-hunter-green p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-lg font-bold relative">Actions</CardTitle>
              </div>
              <CardContent className="p-5 space-y-2">
                <UserActionButtons userId={userProfile.id} status={userProfile.status} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

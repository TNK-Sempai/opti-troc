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
    validated: { label: 'Validé', color: 'bg-green-600' },
    pending: { label: 'En attente', color: 'bg-yellow-600' },
    incomplete: { label: 'Incomplet', color: 'bg-neutral-400' },
    rejected: { label: 'Rejeté', color: 'bg-red-600' },
    suspended: { label: 'Suspendu', color: 'bg-orange-600' },
  }
  const currentStatus = statusConfig[userProfile.status as keyof typeof statusConfig] || statusConfig.incomplete

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/20 to-blue-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hover:bg-white/80 hover:shadow-md transition-all duration-300 border border-neutral-200">
              <Link href="/admin/users">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
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
            <Card className="shadow-xl border-purple-200/60 backdrop-blur-sm bg-white/95 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-xl font-bold relative z-10">Informations personnelles</CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-xs text-purple-700 font-bold uppercase tracking-wide">Prénom</p>
                    <p className="font-bold text-lg">{userProfile.first_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-purple-700 font-bold uppercase tracking-wide">Nom</p>
                    <p className="font-bold text-lg">{userProfile.last_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-purple-700 font-bold uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium">{userProfile.email}</p>
                  </div>
                  {userProfile.phone && (
                    <div className="space-y-1">
                      <p className="text-xs text-purple-700 font-bold uppercase tracking-wide">Téléphone</p>
                      <p className="text-sm font-medium">{userProfile.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-blue-200/60 backdrop-blur-sm bg-white/95 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-xl font-bold relative z-10">Entreprise</CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">Nom de l'entreprise</p>
                    <p className="font-bold text-lg">{userProfile.company_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">N° TVA</p>
                    <p className="text-sm font-mono font-bold">{userProfile.vat_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">Adresse</p>
                    <p className="text-sm font-medium">{userProfile.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">Ville</p>
                    <p className="text-sm font-medium">{userProfile.city}, {userProfile.postal_code}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">Pays</p>
                    <p className="text-sm font-medium">{userProfile.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userProfile.status === 'pending' && (
              <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-amber-900">Actions de validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserActionButtons userId={userProfile.id} status={userProfile.status} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl border-neutral-200 backdrop-blur-sm bg-white/95 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-neutral-700 via-neutral-800 to-neutral-900 p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-lg font-bold relative z-10">Informations</CardTitle>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide">Inscription</p>
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
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg font-bold text-sm px-3 py-1.5">
                      🎉 Early Adopter
                    </Badge>
                  </div>
                )}
                {userProfile.role === 'admin' && (
                  <div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg font-bold text-sm px-3 py-1.5">
                      Administrateur
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-purple-200/60 backdrop-blur-sm bg-white/95 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <CardTitle className="text-white text-lg font-bold relative z-10">Actions</CardTitle>
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
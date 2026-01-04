import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, User, Building2, MapPin, Calendar } from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const supabase = await createClient()

  // Vérifier que l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Vérifier que l'utilisateur est admin (avec supabaseAdmin pour bypass RLS)
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Récupérer les comptes en attente (avec supabaseAdmin)
  const { data: pendingUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Récupérer les stats (avec supabaseAdmin)
  const { count: totalUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: validatedUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'validated')

  const { count: pendingCount } = await supabaseAdmin
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">Panel Admin</h1>
              <p className="text-sm text-neutral-600">Gestion des comptes Opti-troc</p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total utilisateurs</CardDescription>
              <CardTitle className="text-3xl">{totalUsers || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Comptes validés</CardDescription>
              <CardTitle className="text-3xl text-success">{validatedUsers || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl text-warning">{pendingCount || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Liste des comptes en attente */}
        <Card>
          <CardHeader>
            <CardTitle>Comptes en attente de validation</CardTitle>
            <CardDescription>
              {pendingCount || 0} compte(s) à vérifier
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!pendingUsers || pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun compte en attente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="p-4 border border-neutral-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {pendingUser.first_name} {pendingUser.last_name}
                          </h3>
                          <p className="text-sm text-neutral-600">{pendingUser.contact_name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        En attente
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Building2 className="w-4 h-4" />
                        <span>{pendingUser.company_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="w-4 h-4" />
                        <span>{pendingUser.city}, {pendingUser.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <FileText className="w-4 h-4" />
                        <span>TVA: {pendingUser.vat_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(pendingUser.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {pendingUser.is_early_adopter && (
                      <Badge className="mb-3 bg-warning/10 text-warning border-warning/30">
                        🎉 Early Adopter
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/admin/users/${pendingUser.id}`}>
                          Voir le détail
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
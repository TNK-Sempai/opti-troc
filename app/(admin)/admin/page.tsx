import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, User, Building2, MapPin, Calendar, Users, Package, Mail, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Stats globales
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

  const { count: unreadMessages } = await supabaseAdmin
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: totalListings } = await supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Derniers comptes en attente
  const { data: pendingUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Stats principales */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Vue d'ensemble</h2>
        <p className="text-sm text-muted-foreground">Statistiques de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Utilisateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{validatedUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Validés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount || 0}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{unreadMessages || 0}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{totalListings || 0}</p>
                <p className="text-xs text-muted-foreground">Annonces</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <Link href="/admin/users?status=pending" className="block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-yellow-600" />
                </div>
                {pendingCount && pendingCount > 0 && (
                  <Badge className="bg-yellow-600 text-white">{pendingCount}</Badge>
                )}
              </div>
              <h3 className="font-semibold mb-1">Validations en attente</h3>
              <p className="text-sm text-muted-foreground">
                Gérer les nouvelles inscriptions
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <Link href="/dashboard/messages?status=new" className="block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                {unreadMessages && unreadMessages > 0 && (
                  <Badge className="bg-blue-600 text-white">{unreadMessages}</Badge>
                )}
              </div>
              <h3 className="font-semibold mb-1">Nouveaux messages</h3>
              <p className="text-sm text-muted-foreground">
                Répondre aux demandes de contact
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <Link href="/dashboard/listings" className="block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">Toutes les annonces</h3>
              <p className="text-sm text-muted-foreground">
                Consulter le marketplace complet
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Liste des comptes en attente */}
      {pendingUsers && pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dernières demandes</CardTitle>
                <CardDescription>
                  {pendingCount ?? 0} compte{(pendingCount ?? 0) > 1 ? 's' : ''} en attente de validation
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/users?status=pending">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {user.first_name} {user.last_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {user.company_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/admin/users/${user.id}`}>Examiner</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
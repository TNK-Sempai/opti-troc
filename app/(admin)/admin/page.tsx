import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'
import { FileText, User, Building2, MapPin, Calendar, Users, Package, Mail, TrendingUp, Shield } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/20 to-blue-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Stats principales */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
              <Shield className="w-10 h-10 text-purple-600" />
              Administration
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">Statistiques de la plateforme</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Utilisateurs"
            value={totalUsers || 0}
            gradient="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Validés"
            value={validatedUsers || 0}
            gradient="success"
          />
          <StatCard
            icon={User}
            label="En attente"
            value={pendingCount || 0}
            gradient="secondary"
          />
          <StatCard
            icon={Mail}
            label="Messages"
            value={unreadMessages || 0}
            gradient="primary"
          />
          <StatCard
            icon={Package}
            label="Annonces"
            value={totalListings || 0}
            gradient="purple"
          />
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users?status=pending" className="block group">
            <Card className="border-amber-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-amber-400">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    {pendingCount && pendingCount > 0 && (
                      <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg font-bold">{pendingCount}</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Validations en attente</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Gérer les nouvelles inscriptions
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/messages?status=new" className="block group">
            <Card className="border-blue-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-blue-400">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    {unreadMessages && unreadMessages > 0 && (
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg font-bold">{unreadMessages}</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Nouveaux messages</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Répondre aux demandes de contact
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/listings" className="block group">
            <Card className="border-purple-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-purple-400">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Toutes les annonces</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Consulter le marketplace complet
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Liste des comptes en attente */}
        {pendingUsers && pendingUsers.length > 0 && (
          <Card className="shadow-xl border-amber-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <CardTitle className="text-white text-2xl font-bold mb-2">Dernières demandes</CardTitle>
                  <CardDescription className="text-amber-100 text-base font-medium">
                    {pendingCount ?? 0} compte{(pendingCount ?? 0) > 1 ? 's' : ''} en attente de validation
                  </CardDescription>
                </div>
                <PremiumButton asChild variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
                  <Link href="/admin/users?status=pending"><span>Voir tout</span></Link>
                </PremiumButton>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-5 border-2 border-amber-200/60 rounded-2xl hover:border-amber-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-amber-50/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base mb-1">
                            {user.first_name} {user.last_name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5" />
                              {user.company_name}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {user.city}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <PremiumButton asChild size="sm" gradient="primary">
                        <Link href={`/admin/users/${user.id}`}><span>Examiner</span></Link>
                      </PremiumButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

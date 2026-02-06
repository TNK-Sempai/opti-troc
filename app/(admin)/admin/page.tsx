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
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Stats principales */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="text-forest-gradient drop-shadow-sm flex items-center gap-3">
              <Shield className="w-10 h-10 text-pine-teal" />
              Administration
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">Statistiques de la plateforme</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Utilisateurs"
            value={totalUsers || 0}
            gradient="primary"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Validés"
            value={validatedUsers || 0}
            gradient="success"
          />
          <StatCard
            icon={<User className="w-5 h-5" />}
            label="En attente"
            value={pendingCount || 0}
            gradient="secondary"
          />
          <StatCard
            icon={<Mail className="w-5 h-5" />}
            label="Messages"
            value={unreadMessages || 0}
            gradient="primary"
          />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Annonces"
            value={totalListings || 0}
            gradient="purple"
          />
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users?status=pending" className="block group">
            <Card className="border-dry-sage/40 hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-fern/40">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-dry-sage/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gold to-gold-hover rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    {pendingCount && pendingCount > 0 && (
                      <Badge className="bg-gold text-white border-0 shadow-lg font-bold">{pendingCount}</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">Validations en attente</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Gérer les nouvelles inscriptions
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/messages?status=new" className="block group">
            <Card className="border-dry-sage/40 hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-fern/40">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-pine-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pine-teal to-hunter-green rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    {unreadMessages && unreadMessages > 0 && (
                      <Badge className="bg-gradient-to-r from-pine-teal to-hunter-green text-white border-0 shadow-lg font-bold">{unreadMessages}</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">Nouveaux messages</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Répondre aux demandes de contact
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/listings" className="block group">
            <Card className="border-dry-sage/40 hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-fern/40">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-fern/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-fern to-hunter-green rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">Toutes les annonces</h3>
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
          <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden">
            <div className="bg-gradient-to-r from-gold to-gold-hover p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
              </div>
              <div className="flex items-center justify-between relative">
                <div>
                  <CardTitle className="text-white text-2xl font-bold mb-2">Dernières demandes</CardTitle>
                  <CardDescription className="text-off-white text-base font-medium">
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
                    className="p-5 border-2 border-dry-sage/40 rounded-2xl hover:border-fern/40 hover:shadow-lg transition-all duration-300 bg-off-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-hover rounded-2xl flex items-center justify-center shadow-lg">
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

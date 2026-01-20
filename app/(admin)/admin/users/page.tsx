import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PremiumButton } from '@/components/ui/premium-button'
import { StatCard } from '@/components/ui/stat-card'
import Link from 'next/link'
import { User, Building2, MapPin, Calendar, Search, FileText, Users, CheckCircle, Clock, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
  search?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  let query = supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: users } = await query

  let filteredUsers = users || []
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredUsers = filteredUsers.filter(user =>
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.company_name?.toLowerCase().includes(searchLower)
    )
  }

  const stats = {
    total: users?.length || 0,
    validated: users?.filter(u => u.status === 'validated').length || 0,
    pending: users?.filter(u => u.status === 'pending').length || 0,
    rejected: users?.filter(u => u.status === 'rejected').length || 0,
  }

  const statusLabels: Record<string, { label: string; gradient: string; border: string }> = {
    validated: { label: 'Validé', gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-200' },
    pending: { label: 'En attente', gradient: 'from-amber-500 to-amber-600', border: 'border-amber-200' },
    incomplete: { label: 'Incomplet', gradient: 'from-neutral-400 to-neutral-500', border: 'border-neutral-200' },
    rejected: { label: 'Rejeté', gradient: 'from-red-500 to-red-600', border: 'border-red-200' },
    suspended: { label: 'Suspendu', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-200' },
  }

  const currentStatus = params.status || 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/20 to-blue-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
                <Users className="w-10 h-10 text-purple-600" />
                Utilisateurs
              </span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total" value={stats.total} gradient="primary" />
          <StatCard icon={CheckCircle} label="Validés" value={stats.validated} gradient="success" />
          <StatCard icon={Clock} label="En attente" value={stats.pending} gradient="secondary" />
          <StatCard icon={XCircle} label="Rejetés" value={stats.rejected} gradient="danger" />
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <form method="GET" className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-purple-600 transition-colors" />
              <Input
                name="search"
                placeholder="Rechercher par nom, entreprise..."
                defaultValue={params.search}
                className="pl-11 h-12 shadow-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium"
              />
            </form>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/users?status=all"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'all'
                  ? 'bg-gradient-to-r from-neutral-700 to-neutral-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-neutral-200 hover:border-neutral-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Tous</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentStatus === 'all' ? 'bg-white/20 text-white border-0' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {stats.total}
              </Badge>
            </Link>

            <Link
              href="/admin/users?status=validated"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'validated'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Validés</span>
              {stats.validated > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'validated'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {stats.validated}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/users?status=pending"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'pending'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">En attente</span>
              {stats.pending > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'pending'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {stats.pending}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/users?status=rejected"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'rejected'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-red-200 hover:border-red-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Rejetés</span>
              {stats.rejected > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'rejected'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.rejected}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        {/* Liste */}
        <Card className="shadow-xl border-purple-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
          <CardContent className="p-0">
            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {filteredUsers.map((user) => {
                  const statusInfo = statusLabels[user.status] || statusLabels.incomplete

                  return (
                    <div
                      key={user.id}
                      className={`p-5 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-300 border-l-4 ${statusInfo.border}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${statusInfo.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                              <h4 className="font-bold text-base bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                                {user.first_name} {user.last_name}
                              </h4>
                              <Badge className={`bg-gradient-to-r ${statusInfo.gradient} text-white text-xs border-0 shadow-sm font-bold`}>
                                {statusInfo.label}
                              </Badge>
                              {user.role === 'admin' && (
                                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 font-bold">Admin</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                {user.company_name}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {user.city}, {user.country}
                              </span>
                              {user.vat_number && (
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" />
                                  {user.vat_number}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-lg">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <PremiumButton asChild size="sm" gradient="primary">
                          <Link href={`/admin/users/${user.id}`}><span>Détails</span></Link>
                        </PremiumButton>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-neutral-50 opacity-50 rounded-xl" />
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-purple-600" />
                  </div>
                  <p className="text-neutral-700 font-bold mb-2 text-xl">Aucun utilisateur</p>
                  <p className="text-base text-muted-foreground font-medium">
                    {params.search || params.status !== 'all'
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Les nouveaux utilisateurs apparaîtront ici'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
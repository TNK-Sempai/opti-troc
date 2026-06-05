import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateUserStatus } from '@/lib/validations/query-params'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PremiumButton } from '@/components/ui/premium-button'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Building2, MapPin, Calendar, Search, FileText, Users, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
  search?: string
  page?: string
  pageSize?: string
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

  const validStatus = validateUserStatus(params.status);
  if (validStatus) {
    query = query.eq('status', validStatus)
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

  // Pagination
  const pageSizeVal = Math.min(parseInt(params.pageSize || '25') || 25, 100)
  const totalResults = filteredUsers.length
  const totalPages = Math.ceil(totalResults / pageSizeVal)
  const pageNum = Math.max(1, Math.min(parseInt(params.page || '1') || 1, totalPages || 1))
  const offsetVal = (pageNum - 1) * pageSizeVal
  const paginatedUsers = filteredUsers.slice(offsetVal, offsetVal + pageSizeVal)

  function buildUrl(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (params.status) base.status = params.status
    if (params.search) base.search = params.search
    base.pageSize = String(pageSizeVal)
    return `/admin/users?${new URLSearchParams({ ...base, ...overrides }).toString()}`
  }

  const stats = {
    total: users?.length || 0,
    validated: users?.filter(u => u.status === 'validated').length || 0,
    pending: users?.filter(u => u.status === 'pending').length || 0,
    rejected: users?.filter(u => u.status === 'rejected').length || 0,
  }

  const statusLabels: Record<string, { label: string; gradient: string; border: string }> = {
    validated: { label: 'Validé', gradient: 'from-fern to-hunter-green', border: 'border-fern/30' },
    pending: { label: 'En attente', gradient: 'from-gold to-gold-hover', border: 'border-gold/30' },
    incomplete: { label: 'Incomplet', gradient: 'from-medium-grey to-dark-grey', border: 'border-light-grey' },
    rejected: { label: 'Rejeté', gradient: 'from-red-500 to-red-600', border: 'border-red-200' },
    suspended: { label: 'Suspendu', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-200' },
  }

  const currentStatus = params.status || 'all'

  return (
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              <span className="text-forest-gradient drop-shadow-sm flex items-center gap-3">
                <Users className="w-10 h-10 text-pine-teal" />
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
          <StatCard icon={<Users className="w-5 h-5" />} label="Total" value={stats.total} gradient="primary" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Validés" value={stats.validated} gradient="success" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="En attente" value={stats.pending} gradient="secondary" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Rejetés" value={stats.rejected} gradient="danger" />
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <form method="GET" className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-pine-teal transition-colors" />
              <Input
                name="search"
                placeholder="Rechercher par nom, entreprise..."
                defaultValue={params.search}
                className="pl-11 h-12 shadow-lg border-2 border-dry-sage focus:border-fern focus:ring-2 focus:ring-fern/20 font-medium"
              />
            </form>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/users?status=all"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'all'
                  ? 'bg-gradient-to-r from-dark-grey to-charcoal text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-light-grey hover:border-medium-grey hover:shadow-lg hover:scale-105'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Tous</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentStatus === 'all' ? 'bg-white/20 text-white border-0' : 'bg-dust-grey text-dark-grey'
              }`}>
                {stats.total}
              </Badge>
            </Link>

            <Link
              href="/admin/users?status=validated"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'validated'
                  ? 'bg-gradient-to-r from-fern to-hunter-green text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-fern/30 hover:border-fern/50 hover:shadow-lg hover:scale-105'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Validés</span>
              {stats.validated > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'validated'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-fern/10 text-fern'
                }`}>
                  {stats.validated}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/users?status=pending"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'pending'
                  ? 'bg-gradient-to-r from-gold to-gold-hover text-charcoal shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-dry-sage hover:border-gold/40 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">En attente</span>
              {stats.pending > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'pending'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-gold/10 text-gold'
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
        <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden">
          <CardContent className="p-0">
            {paginatedUsers.length > 0 ? (
              <div className="divide-y divide-light-grey">
                {paginatedUsers.map((user) => {
                  const statusInfo = statusLabels[user.status] || statusLabels.incomplete

                  return (
                    <div
                      key={user.id}
                      className={`p-5 hover:bg-gradient-to-r hover:from-pine-teal/5 hover:to-transparent transition-all duration-300 border-l-4 ${statusInfo.border}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${statusInfo.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                              <h4 className="font-bold text-base bg-gradient-to-r from-charcoal to-dark-grey bg-clip-text text-transparent">
                                {user.first_name} {user.last_name}
                              </h4>
                              <Badge className={`bg-gradient-to-r ${statusInfo.gradient} text-white text-xs border-0 shadow-sm font-bold`}>
                                {statusInfo.label}
                              </Badge>
                              {user.role === 'admin' && (
                                <Badge variant="outline" className="text-xs border-pine-teal text-pine-teal font-bold">Admin</Badge>
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
                              <span className="flex items-center gap-1.5 bg-dust-grey px-2.5 py-1 rounded-lg">
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
                <div className="absolute inset-0 bg-pine-teal/5 opacity-50 rounded-xl" />
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-pine-teal/10 rounded-3xl flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-pine-teal" />
                  </div>
                  <p className="text-dark-grey font-bold mb-2 text-xl">Aucun utilisateur</p>
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

        {/* Pagination */}
        {totalResults > 0 && (
          <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white mt-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  {[25, 50, 100].map(size => (
                    <Button
                      key={size}
                      asChild
                      variant={pageSizeVal === size ? 'default' : 'outline'}
                      size="sm"
                      className={pageSizeVal === size
                        ? 'bg-pine-teal text-white hover:bg-hunter-green font-bold'
                        : 'border-dry-sage hover:border-fern hover:text-pine-teal font-semibold'}
                    >
                      <Link href={buildUrl({ pageSize: String(size), page: '1' })}>{size}</Link>
                    </Button>
                  ))}
                  <span className="text-sm text-muted-foreground font-medium ml-1">par page</span>
                </div>

                <p className="text-sm font-semibold text-muted-foreground">
                  <span className="text-charcoal">{offsetVal + 1}-{Math.min(offsetVal + pageSizeVal, totalResults)}</span> sur{' '}
                  <span className="text-charcoal">{totalResults}</span>
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {pageNum > 1 && (
                      <Button asChild variant="outline" size="sm" className="border-dry-sage hover:border-fern hover:text-pine-teal font-semibold">
                        <Link href={buildUrl({ page: String(pageNum - 1) })}><ChevronLeft className="w-4 h-4" /></Link>
                      </Button>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let p = i + 1
                      if (totalPages > 5 && pageNum > 3) {
                        p = pageNum - 2 + i
                        if (p > totalPages) p = totalPages - (4 - i)
                      }
                      return (
                        <Button
                          key={p}
                          asChild
                          variant={p === pageNum ? 'default' : 'ghost'}
                          size="sm"
                          className={p === pageNum
                            ? 'w-9 bg-pine-teal text-white hover:bg-hunter-green font-bold'
                            : 'w-9 hover:bg-dust-grey hover:text-pine-teal font-semibold'}
                        >
                          <Link href={buildUrl({ page: String(p) })}>{p}</Link>
                        </Button>
                      )
                    })}
                    {pageNum < totalPages && (
                      <Button asChild variant="outline" size="sm" className="border-dry-sage hover:border-fern hover:text-pine-teal font-semibold">
                        <Link href={buildUrl({ page: String(pageNum + 1) })}><ChevronRight className="w-4 h-4" /></Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

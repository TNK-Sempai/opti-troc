import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { User, Building2, MapPin, Calendar, Search, FileText } from 'lucide-react'

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

  const statusLabels: Record<string, { label: string; color: string }> = {
    validated: { label: 'Validé', color: 'bg-green-600' },
    pending: { label: 'En attente', color: 'bg-yellow-600' },
    incomplete: { label: 'Incomplet', color: 'bg-neutral-400' },
    rejected: { label: 'Rejeté', color: 'bg-red-600' },
    suspended: { label: 'Suspendu', color: 'bg-orange-600' },
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
            <p className="text-xs text-muted-foreground">Validés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejetés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form method="GET" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Rechercher par nom, entreprise..."
                  defaultValue={params.search}
                  className="pl-10 h-11"
                />
              </form>
            </div>
            <div className="flex gap-2">
              <Button asChild variant={!params.status || params.status === 'all' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/users?status=all">Tous</Link>
              </Button>
              <Button asChild variant={params.status === 'validated' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/users?status=validated">Validés</Link>
              </Button>
              <Button asChild variant={params.status === 'pending' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/users?status=pending">En attente</Link>
              </Button>
              <Button asChild variant={params.status === 'rejected' ? 'default' : 'outline'} size="sm">
                <Link href="/admin/users?status=rejected">Rejetés</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length > 0 ? (
            <div className="divide-y">
              {filteredUsers.map((user) => {
                const statusInfo = statusLabels[user.status] || statusLabels.incomplete
                
                return (
                  <div key={user.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {user.first_name} {user.last_name}
                            </h4>
                            <Badge className={`${statusInfo.color} text-white text-xs h-5`}>
                              {statusInfo.label}
                            </Badge>
                            {user.role === 'admin' && (
                              <Badge variant="outline" className="text-xs h-5">Admin</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {user.company_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.city}, {user.country}
                            </span>
                            {user.vat_number && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {user.vat_number}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/admin/users/${user.id}`}>Détails</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
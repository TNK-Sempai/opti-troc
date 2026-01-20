import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { StatCard } from '@/components/ui/stat-card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search, Plus, Package, Bell, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react'
import { WantedItemForm } from '@/components/wanted-items/WantedItemForm'
import { WantedItemActions } from '@/components/wanted-items/WantedItemActions'

export const dynamic = 'force-dynamic'

export default async function DashboardWantedItemsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/wanted-items')
  }

  // Récupérer les recherches de l'utilisateur
  const { data: wantedItems } = await supabase
    .from('wanted_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Récupérer les notifications non lues
  const { data: notifications, count: unreadCount } = await supabase
    .from('wanted_item_notifications')
    .select(`
      *,
      wanted_items(*),
      listings(
        *,
        unit_listings(*),
        listing_photos(*)
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const stats = {
    total: wantedItems?.length || 0,
    active: wantedItems?.filter(i => i.status === 'active').length || 0,
    fulfilled: wantedItems?.filter(i => i.status === 'fulfilled').length || 0,
    notifications: unreadCount || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-emerald-50/20 to-teal-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
              <Search className="w-10 h-10 text-emerald-600" />
              Mes recherches
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Gérez vos recherches de paires et recevez des notifications automatiques
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Search} label="Total" value={stats.total} gradient="primary" />
          <StatCard icon={Clock} label="Actives" value={stats.active} gradient="success" />
          <StatCard icon={CheckCircle2} label="Trouvées" value={stats.fulfilled} gradient="purple" />
          <StatCard icon={Bell} label="Notifications" value={stats.notifications} gradient="secondary" />
        </div>

        {/* Notifications Section */}
        {notifications && notifications.length > 0 && (
          <Card className="mb-8 shadow-xl border-blue-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
              </div>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    Nouvelles correspondances
                    <Badge className="bg-white/20 text-white border-0 font-bold">{unreadCount}</Badge>
                  </CardTitle>
                  <CardDescription className="text-blue-100 font-medium">
                    De nouvelles annonces correspondent à vos recherches
                  </CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {notifications.map((notif: any) => (
                  <NotificationCard key={notif.id} notification={notif} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulaire d'ajout */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-emerald-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-bold">Nouvelle recherche</CardTitle>
                    <CardDescription className="text-emerald-100 font-medium">
                      Indiquez les critères de la paire
                    </CardDescription>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <WantedItemForm />
              </CardContent>
            </Card>
          </div>

          {/* Liste des recherches */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-emerald-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }} />
                </div>
                <div className="relative">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Mes recherches en cours
                  </CardTitle>
                  <CardDescription className="text-emerald-100 font-medium">
                    {wantedItems?.length || 0} recherche{(wantedItems?.length || 0) > 1 ? 's' : ''} active{(wantedItems?.length || 0) > 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="p-6">
                {!wantedItems || wantedItems.length === 0 ? (
                  <div className="text-center py-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-neutral-50 opacity-50 rounded-xl" />
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center shadow-lg">
                        <Search className="w-10 h-10 text-emerald-600" />
                      </div>
                      <p className="text-neutral-700 font-bold mb-2 text-lg">Aucune recherche active</p>
                      <p className="text-muted-foreground font-medium">
                        Utilisez le formulaire pour créer votre première recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wantedItems.map((item: any) => (
                      <WantedItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function WantedItemCard({ item }: { item: any }) {
  const statusConfig = {
    active: { icon: Search, gradient: 'from-emerald-500 to-emerald-600', label: 'Active', border: 'border-emerald-200' },
    fulfilled: { icon: CheckCircle2, gradient: 'from-blue-500 to-blue-600', label: 'Trouvée', border: 'border-blue-200' },
    cancelled: { icon: XCircle, gradient: 'from-neutral-400 to-neutral-500', label: 'Suspendue', border: 'border-neutral-200' },
  }

  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.active
  const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={`p-5 border-2 ${config.border} rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-emerald-50/30`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
            <config.icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <h3 className="font-bold text-base bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent truncate">
                {item.brand} {item.model}
              </h3>
              <Badge className={`bg-gradient-to-r ${config.gradient} text-white text-xs border-0 shadow-sm font-bold`}>
                {config.label}
              </Badge>
            </div>

            {item.reference && (
              <p className="text-xs font-mono bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg inline-block mb-2 font-semibold">
                Réf: {item.reference}
              </p>
            )}

            {item.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-medium">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium flex-wrap">
              <div className="flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>{daysAgo === 0 ? 'Aujourd\'hui' : `Il y a ${daysAgo}j`}</span>
              </div>
              {item.max_price && (
                <span className="font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Max: {parseFloat(item.max_price).toFixed(0)}€
                </span>
              )}
            </div>
          </div>
        </div>

        <WantedItemActions item={item} />
      </div>
    </div>
  )
}

function NotificationCard({ notification }: { notification: any }) {
  const listing = notification.listings
  const unitDetails = listing?.unit_listings?.[0]
  const photo = listing?.listing_photos?.find((p: any) => p.is_primary)

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="p-5 border-2 border-blue-200 rounded-2xl hover:shadow-lg hover:border-blue-400 transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
        <div className="flex gap-5">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            {photo ? (
              <img
                src={photo.photo_url}
                alt="Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg mb-1 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
              {unitDetails?.brand} {unitDetails?.model}
            </h4>
            {unitDetails?.reference && (
              <p className="text-xs font-mono text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg inline-block mb-2 font-semibold">
                {unitDetails.reference}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-3 font-medium">
              Correspond à: <span className="font-bold text-blue-700">
                {notification.wanted_items.brand} {notification.wanted_items.model || ''}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {parseFloat(unitDetails?.price || 0).toFixed(0)}€
              </p>
              <PremiumButton size="sm" gradient="primary">
                <span>Voir l'annonce</span>
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

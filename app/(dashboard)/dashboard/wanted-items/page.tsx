import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search, Plus, Package, Bell, CheckCircle2, XCircle, Clock } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes recherches</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos recherches de paires et recevez des notifications automatiques
        </p>
      </div>

      {/* Notifications Section */}
      {notifications && notifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Nouvelles correspondances trouvées
              <Badge variant="default" className="ml-2">{unreadCount}</Badge>
            </CardTitle>
            <CardDescription>
              De nouvelles annonces correspondent à vos recherches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle recherche
              </CardTitle>
              <CardDescription>
                Indiquez les critères de la paire que vous recherchez
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WantedItemForm />
            </CardContent>
          </Card>
        </div>

        {/* Liste des recherches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mes recherches en cours</CardTitle>
              <CardDescription>
                {wantedItems?.length || 0} recherche(s) active(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!wantedItems || wantedItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Vous n'avez pas encore de recherche active.</p>
                  <p className="text-sm">Utilisez le formulaire pour créer votre première recherche.</p>
                </div>
              ) : (
                <div className="space-y-3">
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
  )
}

function WantedItemCard({ item }: { item: any }) {
  const statusConfig = {
    active: { icon: Search, color: 'bg-blue-500', label: 'Active', badgeVariant: 'default' as const },
    fulfilled: { icon: CheckCircle2, color: 'bg-green-500', label: 'Trouvée', badgeVariant: 'default' as const },
    cancelled: { icon: XCircle, color: 'bg-gray-500', label: 'Suspendue', badgeVariant: 'secondary' as const },
  }

  const config = statusConfig[item.status as keyof typeof statusConfig]
  const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className={`w-2 h-2 rounded-full ${config.color} flex-shrink-0`} />
              <h3 className="font-semibold truncate">
                {item.brand} {item.model}
              </h3>
              <Badge variant={config.badgeVariant} className="text-xs flex-shrink-0">
                {config.label}
              </Badge>
            </div>

            {item.reference && (
              <p className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded inline-block mb-2">
                Réf: {item.reference}
              </p>
            )}

            {item.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{daysAgo === 0 ? 'Aujourd\'hui' : `Il y a ${daysAgo}j`}</span>
              </div>
              {item.max_price && (
                <span className="font-semibold text-primary">
                  Max: {parseFloat(item.max_price).toFixed(0)}€
                </span>
              )}
            </div>
          </div>

          <WantedItemActions item={item} />
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationCard({ notification }: { notification: any }) {
  const listing = notification.listings
  const unitDetails = listing?.unit_listings?.[0]
  const photo = listing?.listing_photos?.find((p: any) => p.is_primary)

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="hover:shadow-md transition-shadow border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
              {photo ? (
                <img
                  src={photo.photo_url}
                  alt="Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-neutral-300" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {unitDetails?.brand} {unitDetails?.model}
              </h4>
              {unitDetails?.reference && (
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  {unitDetails.reference}
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-2">
                Correspond à votre recherche: <span className="font-semibold text-foreground">
                  {notification.wanted_items.brand} {notification.wanted_items.model || ''}
                </span>
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-primary">
                  {parseFloat(unitDetails?.price || 0).toFixed(0)}€
                </p>
                <Button size="sm" variant="default">
                  Voir l'annonce
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

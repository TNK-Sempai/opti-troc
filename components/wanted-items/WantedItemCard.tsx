'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, User, Lock } from 'lucide-react'
import Link from 'next/link'
import { ContactBuyerButton } from '@/components/messages/ContactBuyerButton'

interface WantedItemCardProps {
  item: any
  isValidated: boolean
  currentUserId: string | null
}

export function WantedItemCard({ item, isValidated, currentUserId }: WantedItemCardProps) {
  const profile = item.user_profiles
  const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))

  const isOwnItem = currentUserId === item.user_id
  const buyerName = profile?.company_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'l\'acheteur'
  const itemTitle = `${item.brand} ${item.model}${item.reference ? ` (Réf: ${item.reference})` : ''}`

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête */}
          <div>
            <h3 className="font-bold text-lg mb-1">
              {item.brand} {item.model}
            </h3>
            {item.reference && (
              <p className="text-xs font-mono bg-dust-grey px-2 py-1 rounded inline-block">
                Réf: {item.reference}
              </p>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Budget */}
          {item.max_price && (
            <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded">
              <span className="text-xs font-medium text-muted-foreground">Budget maximum</span>
              <span className="font-bold text-primary">
                {parseFloat(item.max_price).toFixed(0)}€
              </span>
            </div>
          )}

          {/* Bouton de contact */}
          {isOwnItem ? (
            <Button disabled className="w-full" size="sm" variant="outline">
              <User className="w-4 h-4 mr-1.5" />
              Votre recherche
            </Button>
          ) : isValidated ? (
            <ContactBuyerButton
              wantedItemId={item.id}
              buyerName={buyerName}
              itemTitle={itemTitle}
            />
          ) : currentUserId ? (
            <Button disabled className="w-full" size="sm" variant="outline">
              <Lock className="w-4 h-4 mr-1.5" />
              Compte validé requis
            </Button>
          ) : (
            <Button asChild className="w-full" size="sm">
              <Link href="/login">
                Connectez-vous pour contacter
              </Link>
            </Button>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Il y a {daysAgo === 0 ? 'aujourd\'hui' : `${daysAgo}j`}</span>
            </div>
            {profile && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[150px]">
                  {buyerName}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

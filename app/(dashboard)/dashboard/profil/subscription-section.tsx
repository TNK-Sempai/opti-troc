'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CreditCard, Loader2, Sparkles } from 'lucide-react'

interface SubscriptionSectionProps {
  subscriptionStatus: string | null
  promoEndDate: string | null
  isEarlyAdopter: boolean
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-fern/10 text-hunter-green border-fern/30' },
  past_due: {
    label: 'Paiement en retard',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  inactive: {
    label: 'Inactif',
    className: 'bg-light-grey text-dark-grey border-medium-grey/30',
  },
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function SubscriptionSection({
  subscriptionStatus,
  promoEndDate,
  isEarlyAdopter,
}: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // past_due a bien un customer Stripe : c'est le portail qui permet de mettre
  // à jour la carte, pas une nouvelle souscription.
  const hasBillingAccount =
    subscriptionStatus === 'active' || subscriptionStatus === 'past_due'

  const status = subscriptionStatus
    ? STATUS_LABELS[subscriptionStatus] ?? {
        label: subscriptionStatus,
        className: 'bg-light-grey text-dark-grey border-medium-grey/30',
      }
    : {
        label: 'Aucun abonnement',
        className: 'bg-light-grey text-dark-grey border-medium-grey/30',
      }

  const promoActive =
    isEarlyAdopter && promoEndDate && new Date(promoEndDate).getTime() > Date.now()

  async function openPortal() {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ouverture du portail')
      }

      if (data.url) {
        // URL externe (billing.stripe.com) : navigation hors app.
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-off-white border-light-grey border-t-4 border-t-gold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pine-teal">
          <CreditCard className="w-5 h-5" />
          Abonnement
        </CardTitle>
        <CardDescription>Votre formule et votre facturation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4 p-4 bg-dust-grey rounded-lg border border-light-grey">
          <div>
            <p className="text-sm text-medium-grey mb-1">Statut</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        {promoActive && promoEndDate && (
          <div className="flex gap-3 p-4 bg-gold/10 border border-gold/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-charcoal">
                Offre de lancement Early Bird
              </p>
              <p className="text-sm text-dark-grey mt-0.5">
                Votre tarif préférentiel court jusqu&apos;au {formatDate(promoEndDate)}.
              </p>
            </div>
          </div>
        )}

        {subscriptionStatus === 'past_due' && (
          <p className="text-sm text-amber-800">
            Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour
            conserver l&apos;accès à la plateforme.
          </p>
        )}

        {hasBillingAccount ? (
          <Button
            type="button"
            onClick={openPortal}
            disabled={isLoading}
            className="w-full sm:w-auto bg-pine-teal hover:bg-hunter-green text-white border-0 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ouverture du portail...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Gérer mon abonnement
              </>
            )}
          </Button>
        ) : (
          <Button
            asChild
            className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-charcoal font-semibold border-0"
          >
            <Link href="/inscription/plans">
              <CreditCard className="w-4 h-4 mr-2" />
              Souscrire
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

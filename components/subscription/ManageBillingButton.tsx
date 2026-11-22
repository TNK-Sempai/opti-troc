'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ManageBillingButtonProps {
  label?: string
  className?: string
  size?: 'default' | 'sm' | 'lg'
}

/**
 * Ouvre le portail de facturation Stripe (mise à jour de carte, factures).
 * Même appel que la section abonnement du profil.
 */
export function ManageBillingButton({
  label = 'Mettre à jour ma carte',
  className,
  size = 'default',
}: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openPortal() {
    if (isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'ouverture du portail")
      }

      if (data.url) {
        // URL externe (billing.stripe.com) : navigation hors app.
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[ManageBillingButton] Ouverture du portail impossible', {
        message: err instanceof Error ? err.message : String(err),
      })
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        size={size}
        onClick={openPortal}
        disabled={isLoading}
        className={
          className ??
          'bg-pine-teal hover:bg-hunter-green text-white border-0 font-semibold'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Ouverture du portail...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            {label}
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}

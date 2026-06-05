'use client'

import Link from 'next/link'
import { Lock, CreditCard, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SubscriptionGateProps {
  /** Content to show when subscription is active */
  children: React.ReactNode
  /** Whether the subscription is active */
  isActive: boolean
  /** Feature name shown in the locked state */
  featureName?: string
}

export function SubscriptionGate({
  children,
  isActive,
  featureName = 'cette fonctionnalité',
}: SubscriptionGateProps) {
  if (isActive) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred preview of the content */}
      <div className="opacity-30 pointer-events-none select-none blur-[2px]" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Card className="max-w-sm w-full mx-4 shadow-2xl border-pine-teal/30 bg-off-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 bg-pine-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-pine-teal" />
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">
              Abonnement requis
            </h3>
            <p className="text-sm text-dark-grey mb-6">
              Activez ou renouvelez votre abonnement Opti-Troc pour accéder à {featureName}.
            </p>
            <Button
              asChild
              className="w-full bg-pine-teal hover:bg-hunter-green text-white border-0 font-semibold"
            >
              <Link href="/inscription/plans">
                <CreditCard className="w-4 h-4 mr-2" />
                Choisir une formule
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

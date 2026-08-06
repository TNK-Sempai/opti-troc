'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Zap, Star, Crown } from 'lucide-react'

interface Plan {
  id: 'early_bird' | 'mensuel' | 'annuel'
  name: string
  price: string
  period: string
  description: string
  features: string[]
  badge?: string
  badgeColor?: string
  icon: React.ElementType
  highlight?: boolean
  earlyBirdOnly?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'early_bird',
    name: 'Early Bird',
    price: '3 €',
    period: 'pour 3 mois',
    description: 'Offre de lancement — 1 par établissement, 2000 places',
    features: [
      'Accès complet à la marketplace',
      'Annonces illimitées',
      'Messagerie professionnelle',
      'Support prioritaire',
      'Badge Early Adopter',
    ],
    badge: 'Offre exclusive',
    badgeColor: 'bg-gold text-pine-teal',
    icon: Star,
    earlyBirdOnly: true,
  },
  {
    id: 'mensuel',
    name: 'Mensuel',
    price: '14,99 €',
    period: '/ mois',
    description: 'Flexibilité totale, sans engagement',
    features: [
      'Accès complet à la marketplace',
      'Annonces illimitées',
      'Messagerie professionnelle',
      'Support standard',
    ],
    icon: Zap,
    highlight: false,
  },
  {
    id: 'annuel',
    name: 'Annuel',
    price: '129 €',
    period: '/ an',
    description: 'Économisez 51 € par rapport au mensuel',
    features: [
      'Accès complet à la marketplace',
      'Annonces illimitées',
      'Messagerie professionnelle',
      'Support prioritaire',
      '2 mois offerts',
    ],
    badge: 'Meilleure valeur',
    badgeColor: 'bg-fern text-white',
    icon: Crown,
    highlight: true,
  },
]

interface PlanSelectionClientProps {
  isEarlyAdopter: boolean
  displayName: string
}

export function PlanSelectionClient({ isEarlyAdopter, displayName }: PlanSelectionClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSelectPlan(planId: string) {
    setLoadingPlan(planId)
    setError(null)

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session')
      }

      if (data.url) {
        // URL externe (checkout.stripe.com) : navigation hors app, le router
        // Next ne gère que les routes internes.
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoadingPlan(null)
    }
  }

  const visiblePlans = PLANS.filter((p) => !p.earlyBirdOnly || isEarlyAdopter)

  return (
    <div className="min-h-dvh bg-dust-grey py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-12">
              <Image src="/opti-troc-logo.png" alt="Opti-Troc" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-pine-teal mb-3">
            Choisissez votre formule
          </h1>
          <p className="text-dark-grey text-lg">
            Bienvenue{displayName ? `, ${displayName}` : ''} ! Une dernière étape avant d&apos;accéder à la plateforme.
          </p>

          {isEarlyAdopter && (
            <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gold/10 border border-gold/30 rounded-full">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <span className="text-sm font-semibold text-gold">
                Félicitations ! Vous faites partie des 2000 Early Adopters
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center max-w-xl mx-auto">
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div
          className={`grid gap-6 ${
            visiblePlans.length === 3
              ? 'md:grid-cols-3'
              : visiblePlans.length === 2
              ? 'md:grid-cols-2 max-w-2xl mx-auto'
              : 'max-w-sm mx-auto'
          }`}
        >
          {visiblePlans.map((plan) => {
            const Icon = plan.icon
            const isLoading = loadingPlan === plan.id
            const isDisabled = loadingPlan !== null

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 flex flex-col ${
                  plan.highlight
                    ? 'border-2 border-pine-teal shadow-2xl scale-[1.02]'
                    : plan.id === 'early_bird'
                    ? 'border-2 border-gold/50 shadow-xl'
                    : 'border border-light-grey shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span
                      className={`${plan.badgeColor} text-xs font-bold px-4 py-1 rounded-b-lg`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardContent className="p-6 flex flex-col flex-1" style={{ paddingTop: plan.badge ? '2rem' : undefined }}>
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.id === 'early_bird'
                          ? 'bg-gold/15'
                          : plan.highlight
                          ? 'bg-pine-teal/15'
                          : 'bg-fern/10'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          plan.id === 'early_bird'
                            ? 'text-gold'
                            : plan.highlight
                            ? 'text-pine-teal'
                            : 'text-fern'
                        }`}
                      />
                    </div>
                    <h2 className="text-lg font-bold text-charcoal">{plan.name}</h2>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span
                      className={`text-4xl font-extrabold ${
                        plan.id === 'early_bird'
                          ? 'text-gold'
                          : plan.highlight
                          ? 'text-pine-teal'
                          : 'text-charcoal'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-medium-grey text-sm ml-1">{plan.period}</span>
                  </div>

                  <p className="text-sm text-dark-grey mb-5">{plan.description}</p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm">
                        <Check
                          className={`w-4 h-4 flex-shrink-0 ${
                            plan.id === 'early_bird'
                              ? 'text-gold'
                              : plan.highlight
                              ? 'text-pine-teal'
                              : 'text-fern'
                          }`}
                        />
                        <span className="text-dark-grey">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isDisabled}
                    className={`w-full font-bold h-11 ${
                      plan.id === 'early_bird'
                        ? 'bg-gold hover:bg-gold-hover text-pine-teal border-0'
                        : plan.highlight
                        ? 'bg-pine-teal hover:bg-hunter-green text-white border-0'
                        : 'bg-fern hover:bg-hunter-green text-white border-0'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      'Choisir cette formule'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-medium-grey mt-8">
          Paiement sécurisé par Stripe · Résiliable à tout moment · Sans engagement (formule mensuelle)
        </p>
      </div>
    </div>
  )
}

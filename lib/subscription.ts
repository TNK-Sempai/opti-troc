/**
 * Règles d'accès selon `user_profiles.subscription_status`, qui contient le
 * statut Stripe brut (active, trialing, past_due, canceled, unpaid…) écrit
 * par le webhook. Toute gate d'abonnement doit passer par ici plutôt que de
 * comparer à 'active'.
 */

/** Abonnement en règle : peut tout faire, y compris créer des annonces. */
export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const

/**
 * Accès maintenu : abonnement en règle + délai de grâce pendant les relances
 * de paiement (past_due). Sert aussi à refuser un second abonnement.
 */
export const ACCESS_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due'] as const

interface HasActiveSubscriptionOptions {
  /** Accepter past_due (délai de grâce). Faux par défaut. */
  allowPastDue?: boolean
}

export function hasActiveSubscription(
  status: string | null | undefined,
  { allowPastDue = false }: HasActiveSubscriptionOptions = {}
): boolean {
  if (!status) return false
  const allowed: readonly string[] = allowPastDue
    ? ACCESS_SUBSCRIPTION_STATUSES
    : ACTIVE_SUBSCRIPTION_STATUSES
  return allowed.includes(status)
}

export function isPastDue(status: string | null | undefined): boolean {
  return status === 'past_due'
}

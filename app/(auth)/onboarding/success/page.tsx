import { redirect } from 'next/navigation'

/**
 * Page orpheline : le parcours d'onboarding redirige vers /inscription/plans
 * (voir app/(auth)/onboarding/page.tsx). Elle annonçait "validation en cours"
 * alors que l'utilisateur doit encore payer.
 *
 * Conservée uniquement pour rediriger les accès par URL directe et les vieux
 * liens d'emails.
 */
export default function OnboardingSuccessPage() {
  redirect('/inscription/plans')
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Mail, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function InscriptionSuccesPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  // Sans session_id, la page n'a pas été atteinte depuis un retour Stripe :
  // on ne confirme rien. L'activation réelle du compte reste faite par le
  // webhook (app/api/webhooks/stripe/route.ts), seule source de vérité.
  if (!sessionId) {
    redirect('/inscription/plans')
  }

  return (
    <div className="min-h-screen bg-dust-grey flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-t-4 border-t-fern shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-fern/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-fern" />
          </div>
          <CardTitle className="text-2xl text-charcoal">Paiement confirmé !</CardTitle>
          <CardDescription className="text-base mt-1">
            Votre abonnement est actif. Votre dossier est maintenant en cours de validation.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-charcoal">Validation en cours</p>
              <p className="text-sm text-dark-grey mt-0.5">
                Notre équipe examine votre dossier. Vous recevrez une réponse sous 24–48h.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-pine-teal/5 rounded-xl border border-pine-teal/20">
            <Mail className="w-5 h-5 text-pine-teal flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-charcoal">Email de confirmation</p>
              <p className="text-sm text-dark-grey mt-0.5">
                Un récapitulatif de votre abonnement a été envoyé par Stripe à votre adresse email.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t space-y-2">
            <h3 className="text-sm font-semibold text-charcoal">Prochaines étapes :</h3>
            <ul className="space-y-2 text-sm text-dark-grey">
              {[
                'Vérification de vos documents par notre équipe',
                'Notification par email dès validation',
                "Accès complet à la plateforme B2B pour opticiens",
              ].map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-fern font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full bg-pine-teal hover:bg-hunter-green text-white border-0">
              <Link href="/dashboard/pending">
                Voir mon tableau de bord
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-medium-grey">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

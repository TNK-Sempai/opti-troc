import Link from 'next/link'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function InscriptionAnnulePage() {
  return (
    <div className="min-h-screen bg-dust-grey flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-t-4 border-t-medium-grey shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-medium-grey/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-medium-grey" />
          </div>
          <CardTitle className="text-2xl text-charcoal">Paiement annulé</CardTitle>
          <CardDescription className="text-base mt-1">
            Aucun montant n&apos;a été débité. Vous pouvez choisir une formule à tout moment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          <div className="p-4 bg-dust-grey/60 rounded-xl border border-light-grey">
            <p className="text-sm text-dark-grey text-center">
              Votre dossier d&apos;inscription est enregistré. Il vous suffit de souscrire à une formule
              pour finaliser votre accès à la plateforme.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full bg-pine-teal hover:bg-hunter-green text-white border-0">
              <Link href="/inscription/plans">
                <CreditCard className="w-4 h-4 mr-2" />
                Choisir une formule
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-medium-grey">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

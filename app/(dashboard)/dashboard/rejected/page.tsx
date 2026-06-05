import { XCircle, Mail, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'

export default function RejectedPage() {
  return (
    <div className="min-h-screen bg-dust-grey flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Compte non validé</CardTitle>
          <CardDescription>
            Votre demande d&apos;accès n&apos;a pas pu être acceptée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              Votre dossier a été examiné par notre équipe et ne correspond pas aux critères d&apos;accès à la plateforme Opti-Troc (réservée aux professionnels de l&apos;optique).
            </p>
          </div>

          <div className="flex gap-3 p-4 bg-pine-teal/5 rounded-lg border border-pine-teal/20">
            <Mail className="w-5 h-5 text-pine-teal flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-charcoal">Vous avez reçu un email</p>
              <p className="text-sm text-dark-grey mt-1">
                Consultez votre boite mail pour plus de détails sur la décision.
              </p>
            </div>
          </div>

          <p className="text-sm text-dark-grey text-center">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez-nous à{' '}
            <a href="mailto:contact@opti-troc.com" className="text-pine-teal hover:underline font-medium">
              contact@opti-troc.com
            </a>
          </p>

          <div className="pt-4 border-t flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full text-medium-grey">
                Se déconnecter
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

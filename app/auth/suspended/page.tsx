import { ShieldOff, Mail, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-dust-grey flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <ShieldOff className="w-10 h-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Compte suspendu</CardTitle>
          <CardDescription>
            Votre accès à la plateforme a été temporairement suspendu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              Votre compte a été suspendu par notre équipe de modération. Cette mesure peut être temporaire selon la nature du problème identifié.
            </p>
          </div>

          <div className="flex gap-3 p-4 bg-pine-teal/5 rounded-lg border border-pine-teal/20">
            <Mail className="w-5 h-5 text-pine-teal flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-charcoal">Contactez le support</p>
              <p className="text-sm text-dark-grey mt-1">
                Pour contester cette décision ou obtenir plus d&apos;informations, écrivez-nous.
              </p>
            </div>
          </div>

          <p className="text-sm text-dark-grey text-center">
            Contactez-nous à{' '}
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

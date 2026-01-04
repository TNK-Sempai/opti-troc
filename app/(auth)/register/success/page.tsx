import Link from 'next/link'
import { CheckCircle2, Mail, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
          <CardDescription>
            Votre demande a bien été enregistrée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-3 p-4 bg-info/5 rounded-lg border border-info/20">
              <Mail className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-neutral-900">Email de confirmation envoyé</p>
                <p className="text-sm text-neutral-600 mt-1">
                  Vérifiez votre boîte mail pour confirmer votre adresse email
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
              <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-neutral-900">Validation en cours</p>
                <p className="text-sm text-neutral-600 mt-1">
                  Notre équipe vérifie vos documents. Vous recevrez un email sous 24-48h.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-sm text-neutral-900 mb-2">Prochaines étapes :</h3>
            <ol className="space-y-2 text-sm text-neutral-600">
              <li className="flex gap-2">
                <span className="font-medium text-primary">1.</span>
                Confirmez votre email
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-primary">2.</span>
                Attendez la validation de votre compte
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-primary">3.</span>
                Recevez vos identifiants et commencez à vendre !
              </li>
            </ol>
          </div>

          <Button asChild className="w-full">
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
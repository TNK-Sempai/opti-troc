import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Clock, Mail, FileCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/login/actions'

export default async function OnboardingPendingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('contact_name, first_name, is_early_adopter, created_at')
    .eq('id', user?.id)
    .single()

  return (
    <div className="min-h-screen bg-dust-grey flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-warning" />
          </div>
          <CardTitle className="text-2xl">Validation en cours</CardTitle>
          <CardDescription>
            Votre compte est en cours de vérification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-3 p-4 bg-info/5 rounded-lg border border-info/20">
              <FileCheck className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-charcoal">Documents reçus</p>
                <p className="text-sm text-dark-grey mt-1">
                  Notre équipe vérifie vos informations et documents
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
              <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-charcoal">Délai de validation</p>
                <p className="text-sm text-dark-grey mt-1">
                  Vous recevrez une réponse sous 24-48 heures
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-success/5 rounded-lg border border-success/20">
              <Mail className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-charcoal">Notification par email</p>
                <p className="text-sm text-dark-grey mt-1">
                  Nous vous préviendrons dès que votre compte sera validé
                </p>
              </div>
            </div>
          </div>

          {profile?.is_early_adopter && (
            <div className="p-4 bg-warning/10 border-2 border-warning/30 rounded-lg text-center">
              <p className="text-sm font-semibold text-warning mb-1">
                🎉 Early Adopter
              </p>
              <p className="text-xs text-charcoal">
                Vous bénéficiez de l&apos;offre 1€/mois pendant 3 mois
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-dark-grey text-center mb-4">
              Bonjour {profile?.first_name || profile?.contact_name}, merci pour votre patience !
            </p>

            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">
                Se déconnecter
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

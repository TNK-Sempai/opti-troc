import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AlertCircle, UserCog } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProfileForm } from './profile-form'
import { SubscriptionSection } from './subscription-section'

export default async function ProfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // select('*') volontaire : types/database.types.ts est périmé (il ignore par
  // exemple user_profiles.email, pourtant écrit par registerSimple). Une liste
  // de colonnes explicite fait échouer TOUTE la requête si l'une d'elles a été
  // renommée ou supprimée, et PostgREST renvoie alors data: null.
  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // console.error et non logError : ce dernier est silencieux en production
    // (lib/logger.ts), or c'est précisément en production qu'il faut voir la cause.
    console.error(
      `[dashboard/profil] Profil introuvable pour userId=${user.id}`,
      error
    )
  }

  // Les admins ne sont pas facturés : pas de section abonnement pour eux.
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="text-forest-gradient drop-shadow-sm flex items-center gap-3">
              <UserCog className="w-10 h-10 text-pine-teal" />
              Mon profil
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Modifiez les informations de votre compte et de votre établissement
          </p>
        </div>

        {!profile ? (
          // Sans ligne user_profiles, l'UPDATE de la Server Action ne toucherait
          // aucune ligne et « réussirait » sans rien enregistrer : on n'affiche
          // pas un formulaire vide qui donnerait l'illusion de fonctionner.
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Votre fiche profil est introuvable. Contactez le support à{' '}
              <a href="mailto:contact@opti-troc.com" className="underline font-medium">
                contact@opti-troc.com
              </a>{' '}
              en précisant votre adresse email.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <ProfileForm
              profile={{
                civility: profile.civility,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone,
                company_name: profile.company_name,
                shop_address: profile.shop_address,
                city: profile.city,
                postal_code: profile.postal_code,
                country: profile.country,
                vat_number: profile.vat_number,
                opening_hours: profile.opening_hours,
                profile_photo_url: profile.profile_photo_url,
                shop_photos: profile.shop_photos,
              }}
              email={user.email ?? ''}
            />

            {!isAdmin && (
              <div className="mt-6">
                <SubscriptionSection
                  subscriptionStatus={profile.subscription_status ?? null}
                  promoEndDate={profile.promo_end_date ?? null}
                  isEarlyAdopter={profile.is_early_adopter ?? false}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

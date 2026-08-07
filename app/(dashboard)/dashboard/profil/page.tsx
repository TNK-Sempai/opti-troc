import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { UserCog } from 'lucide-react'
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

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select(
      'civility, first_name, last_name, phone, company_name, shop_address, city, postal_code, country, vat_number, opening_hours, profile_photo_url, shop_photos, role, subscription_status, promo_end_date, is_early_adopter'
    )
    .eq('id', user.id)
    .single()

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

        <ProfileForm profile={profile} email={user.email ?? ''} />

        {!isAdmin && (
          <div className="mt-6">
            <SubscriptionSection
              subscriptionStatus={profile?.subscription_status ?? null}
              promoEndDate={profile?.promo_end_date ?? null}
              isEarlyAdopter={profile?.is_early_adopter ?? false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

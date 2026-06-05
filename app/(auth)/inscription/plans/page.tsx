import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { PlanSelectionClient } from './PlanSelectionClient'

export const dynamic = 'force-dynamic'

export default async function PlansPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('status, is_early_adopter, first_name, company_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Seuls les utilisateurs qui viennent de finir l'onboarding peuvent accéder à cette page
  if (!['incomplete', 'awaiting_payment'].includes(profile.status)) {
    redirect('/dashboard')
  }

  const displayName =
    profile.company_name || profile.first_name || 'votre boutique'

  return (
    <PlanSelectionClient
      isEarlyAdopter={profile.is_early_adopter ?? false}
      displayName={displayName}
    />
  )
}

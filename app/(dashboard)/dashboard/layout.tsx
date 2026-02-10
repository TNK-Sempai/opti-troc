import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import Footer from '@/components/layout/Footer'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('status, role, company_name, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profile?.status !== 'validated') {
    if (profile?.status === 'pending') {
      redirect('/dashboard/pending')
    } else if (profile?.status === 'incomplete') {
      redirect('/onboarding')
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-dust-grey flex flex-col">
      <DashboardNav
        isAdmin={isAdmin}
        userProfile={{
          company_name: profile?.company_name,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
        }}
        userEmail={user.email}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
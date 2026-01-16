import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'

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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('status, role')
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
    <div className="min-h-screen bg-neutral-50">
      <DashboardNav isAdmin={isAdmin} />
      <main>{children}</main>
    </div>
  )
}
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessagingLayout } from '@/components/messaging/MessagingLayout'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function MessagingFallback() {
  return (
    <div className="h-[calc(100dvh-64px)] flex items-center justify-center bg-off-white">
      <Loader2 className="w-8 h-8 animate-spin text-pine-teal/40" />
    </div>
  )
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<MessagingFallback />}>
      <MessagingLayout currentUserId={user.id} />
    </Suspense>
  )
}

import { createClient } from '@/lib/supabase/server'

export async function getPlatformStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_platform_stats')

  if (error) {
    console.error('Stats error:', error)
    return {
      professionals: 0,
      listings: 0,
      satisfaction: 0,
    }
  }

  return {
    professionals: data.professionals_count,
    listings: data.active_listings_count,
    satisfaction: data.average_satisfaction,
  }
}

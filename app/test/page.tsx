import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  // Tester la connexion
  const { data, error } = await supabase
    .from('user_profiles')
    .select('count')
    .single()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Supabase</h1>
      {error ? (
        <div className="text-red-600">Erreur: {error.message}</div>
      ) : (
        <div className="text-green-600">✅ Connexion OK !</div>
      )}
    </div>
  )
}
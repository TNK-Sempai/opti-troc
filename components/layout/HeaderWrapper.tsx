import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "./Header"

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("user_profiles")
      .select("company_name, first_name, last_name")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return <HeaderClient user={user} profile={profile} />
}

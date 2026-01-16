'use client'

import { LogOut } from "lucide-react"
import { logout } from "@/app/(auth)/login/actions"

export function LogoutButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center text-red-600 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Déconnexion
    </button>
  )
}
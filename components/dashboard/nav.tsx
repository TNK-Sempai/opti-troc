'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, Package, Mail, LogOut, Menu, User, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface DashboardNavProps {
  isAdmin?: boolean  // Nouveau prop
}

export function DashboardNav({ isAdmin = false }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/listings',
      label: 'Mes annonces',
      icon: Package,
    },
  ]

  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Opti-Troc
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                  >
                    <Link href={item.href}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Panel Admin</span>
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" size="sm" className="hidden md:flex">
              <Link href="/shop">Marketplace</Link>
            </Button>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Déconnexion</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
            {isAdmin && (
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/admin">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Panel Admin
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/shop">Marketplace</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, Package, Mail, LogOut, Menu, User, ShieldCheck, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface DashboardNavProps {
  isAdmin?: boolean
  userProfile?: {
    company_name?: string
    first_name?: string
    last_name?: string
  }
  userEmail?: string
}

export function DashboardNav({ isAdmin = false, userProfile, userEmail }: DashboardNavProps) {
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
    {
      href: '/dashboard/wanted-items',
      label: 'Mes recherches',
      icon: Search,
    },
    {
      href: '/dashboard/messages',
      label: 'Messagerie',
      icon: Mail,
    },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-blue-200/60 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                <Image
                  src="/opti-troc-logo.png"
                  alt="Opti-Troc Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">
                  Opti-Troc
                </h1>
                <p className="text-xs text-muted-foreground">
                  Dashboard
                </p>
              </div>
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
              <Button asChild variant="outline" size="sm" className="hidden lg:flex">
                <Link href="/admin">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Panel Admin</span>
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" size="sm" className="hidden md:flex">
              <Link href="/shop">Marketplace</Link>
            </Button>

            {/* Menu utilisateur Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  {userProfile && (
                    <span>
                      {userProfile.first_name} {userProfile.last_name}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userProfile && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-semibold">
                        {userProfile.company_name}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-muted-foreground">
                          {userEmail}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/listings">
                    <Package className="w-4 h-4 mr-2" />
                    Mes annonces
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/wanted-items">
                    <Search className="w-4 h-4 mr-2" />
                    Mes recherches
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/messages">
                    <Mail className="w-4 h-4 mr-2" />
                    Messagerie
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu burger Mobile */}
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
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
import { LayoutDashboard, Package, Mail, LogOut, Menu, User, UserCog, ShieldCheck, Search, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

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
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations/unread-count', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count || 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount()

    // Listen for new messages to update badge
    const supabase = createClient()
    const channel = supabase
      .channel('nav-unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => { fetchUnreadCount() }
      )
      .subscribe()

    // Refresh every 30s as fallback
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchUnreadCount])

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
    {
      href: '/dashboard/profil',
      label: 'Mon profil',
      icon: UserCog,
    },
  ]

  return (
    <header className="bg-pine-teal backdrop-blur-sm border-b border-hunter-green sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="relative w-32 h-10 bg-white/10 rounded-lg p-0.5">
                <Image
                  src="/opti-troc-logo.png"
                  alt="Opti-Troc"
                  fill
                  sizes="128px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const showBadge = item.href === '/dashboard/messages' && unreadCount > 0
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`relative ${isActive
                      ? 'bg-hunter-green text-white hover:bg-fern'
                      : 'text-dry-sage hover:text-white hover:bg-hunter-green'
                    }`}
                  >
                    <Link href={item.href}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {showBadge && (
                        <span className="ml-1.5 min-w-[18px] h-[18px] bg-gold text-pine-teal text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden lg:flex h-9 bg-gold hover:bg-gold-hover text-pine-teal font-semibold border-0">
              <Link href="/dashboard/listings/new">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Nouvelle annonce
              </Link>
            </Button>

            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="hidden lg:flex text-dry-sage hover:text-white hover:bg-hunter-green border-0">
                <Link href="/admin">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Panel Admin</span>
                </Link>
              </Button>
            )}

            <Button asChild variant="ghost" size="sm" className="hidden md:flex text-dry-sage hover:text-white hover:bg-hunter-green border-0">
              <Link href="/shop">Marketplace</Link>
            </Button>

            {/* Menu utilisateur Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex text-white hover:bg-hunter-green border-0">
                  <div className="w-6 h-6 bg-fern rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {userProfile && (
                    <span className="text-dust-grey">
                      {userProfile.first_name} {userProfile.last_name}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userProfile && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-semibold text-charcoal">
                        {userProfile.company_name}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-medium-grey">
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
                  <Link href="/dashboard/messages" className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Messagerie
                    </span>
                    {unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] bg-pine-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profil">
                    <UserCog className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Deconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu burger Mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-hunter-green"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-1 border-t border-hunter-green pt-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const showBadge = item.href === '/dashboard/messages' && unreadCount > 0
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start ${isActive
                    ? 'bg-hunter-green text-white hover:bg-fern'
                    : 'text-dry-sage hover:text-white hover:bg-hunter-green'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href={item.href} className="flex items-center justify-between w-full">
                    <span className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </span>
                    {showBadge && (
                      <span className="min-w-[18px] h-[18px] bg-gold text-pine-teal text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )
            })}
            <Button asChild className="w-full justify-start bg-gold hover:bg-gold-hover text-pine-teal font-semibold border-0" size="sm">
              <Link href="/dashboard/listings/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                Nouvelle annonce
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="w-full justify-start text-dry-sage hover:text-white hover:bg-hunter-green">
                <Link href="/admin">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Panel Admin
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-dry-sage hover:text-white hover:bg-hunter-green">
              <Link href="/shop">Marketplace</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}

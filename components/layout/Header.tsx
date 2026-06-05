'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LayoutDashboard, Package, Search, Mail, Menu, Home, PlusCircle } from "lucide-react"
import { LogoutButton } from "@/components/auth/LogoutButton"

interface HeaderClientProps {
  user: any
  profile: any
}

export function HeaderClient({ user, profile }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/conversations/unread-count', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count || 0)
      }
    } catch {}
  }, [user])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const navLinks = [
    { href: '/shop', label: 'Marketplace' },
    { href: '/want-to-buy', label: 'Want to Buy' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 bg-pine-teal border-b border-hunter-green transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 hover:brightness-110 transition-all duration-200">
            <div className="relative w-32 h-12">
              <Image
                src="/opti-troc-logo.png"
                alt="Opti-Troc"
                fill
                sizes="128px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Navigation Desktop — Centre */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium px-4 py-2 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-dust-grey hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions — Droite */}
          <div className="flex items-center gap-3">
            {user && profile ? (
              <>
                {/* CTA Or — le seul element dore */}
                <Button
                  asChild
                  size="sm"
                  className="hidden md:flex rounded-lg px-5 py-2.5 bg-gold hover:bg-gold-hover hover:shadow-md text-pine-teal font-medium border-0 transition-all duration-200"
                >
                  <Link href="/dashboard/listings/new">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Créer une annonce
                  </Link>
                </Button>

                {/* Profil */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 px-2 md:px-3 hover:bg-hunter-green transition-colors duration-200">
                      <div className="w-8 h-8 bg-hunter-green rounded-full flex items-center justify-center">
                        <span className="text-dry-sage text-sm font-semibold">
                          {profile.first_name?.[0]}{profile.last_name?.[0]}
                        </span>
                      </div>
                      <span className="hidden md:inline ml-2 font-medium text-sm text-dust-grey">
                        {profile.first_name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b border-light-grey">
                      <p className="text-sm font-semibold text-charcoal">{profile.company_name}</p>
                      <p className="text-xs text-medium-grey">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/listings" className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2" />
                        Mes annonces
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/wanted-items" className="cursor-pointer">
                        <Search className="w-4 h-4 mr-2" />
                        Mes recherches
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/messages" className="cursor-pointer flex items-center justify-between">
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Connexion — texte simple */}
                <Link
                  href="/login"
                  className="hidden sm:inline text-sm font-medium text-dust-grey hover:text-white transition-colors duration-200"
                >
                  Connexion
                </Link>
                {/* CTA Or */}
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg px-5 py-2.5 bg-gold hover:bg-gold-hover hover:shadow-md text-pine-teal font-medium border-0 transition-all duration-200"
                >
                  <Link href="/register">Créer une annonce</Link>
                </Button>
              </>
            )}

            {/* Menu Mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-10 w-10 p-0 text-dust-grey hover:text-white hover:bg-hunter-green transition-colors duration-200">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-off-white">
                <SheetHeader className="mb-6">
                  <SheetTitle>
                    <div className="relative w-28 h-10">
                      <Image src="/opti-troc-logo.png" alt="Opti-Troc" fill className="object-contain object-left" />
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md font-medium transition-colors ${
                      pathname === '/' ? 'bg-pine-teal/10 text-pine-teal' : 'hover:bg-dust-grey/50 text-dark-grey'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    Accueil
                  </Link>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-md font-medium transition-colors ${
                          isActive ? 'bg-pine-teal/10 text-pine-teal' : 'hover:bg-dust-grey/50 text-dark-grey'
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>

                {!user && (
                  <div className="mt-6 pt-6 border-t border-light-grey space-y-2">
                    <Button asChild variant="outline" className="w-full h-11 border-light-grey">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                    </Button>
                    <Button asChild className="w-full h-11 bg-gold hover:bg-gold-hover text-pine-teal font-medium">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Créer une annonce</Link>
                    </Button>
                  </div>
                )}

                {user && profile && (
                  <div className="mt-6 pt-6 border-t border-light-grey">
                    <div className="px-3 py-3 bg-dust-grey/50 rounded-md mb-4">
                      <p className="text-sm font-semibold text-charcoal">{profile.company_name}</p>
                      <p className="text-xs text-medium-grey">{user.email}</p>
                    </div>
                    <Button asChild className="w-full h-10 bg-gold hover:bg-gold-hover text-pine-teal font-medium mb-3">
                      <Link href="/dashboard/listings/new" onClick={() => setMobileMenuOpen(false)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Créer une annonce
                      </Link>
                    </Button>
                    <nav className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-dust-grey/50 text-dark-grey font-medium"
                      >
                        <LayoutDashboard className="w-5 h-5 text-medium-grey" />
                        Tableau de bord
                      </Link>
                      <Link
                        href="/dashboard/messages"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-dust-grey/50 text-dark-grey font-medium"
                      >
                        <span className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-medium-grey" />
                          Messagerie
                        </span>
                        {unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] bg-pine-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    </nav>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

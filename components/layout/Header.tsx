'use client'

import { useState } from 'react'
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
import { User, LayoutDashboard, Package, Search, Mail, Menu, X, Home, ShoppingBag, Info, Phone } from "lucide-react"
import { LogoutButton } from "@/components/auth/LogoutButton"

interface HeaderClientProps {
  user: any
  profile: any
}

export function HeaderClient({ user, profile }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/shop', label: 'Marketplace', icon: ShoppingBag },
    { href: '/want-to-buy', label: 'Want to Buy', icon: Search },
    { href: '/about', label: 'À propos', icon: Info },
    { href: '/contact', label: 'Contact', icon: Phone },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-lg overflow-hidden shadow-md">
              <Image
                src="/opti-troc-logo.png"
                alt="Opti-Troc Logo"
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-neutral-900">
                Opti-Troc
              </h1>
              <p className="text-[10px] text-neutral-500 font-medium hidden md:block">
                Marketplace B2B Optique
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 px-2 md:px-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </span>
                    </div>
                    <span className="hidden md:inline ml-2 font-semibold text-sm">
                      {profile.first_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-bold">{profile.company_name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
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
                    <Link href="/dashboard/messages" className="cursor-pointer">
                      <Mail className="w-4 h-4 mr-2" />
                      Messagerie
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex h-10 font-semibold">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild size="sm" className="h-10 bg-blue-600 hover:bg-blue-700 font-semibold">
                  <Link href="/register">S'inscrire</Link>
                </Button>
              </>
            )}

            {/* Menu Mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-10 w-10 p-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                      <Image
                        src="/opti-troc-logo.png"
                        alt="Opti-Troc"
                        fill
                        className="object-contain"
                      />
                    </div>
                    Opti-Troc
                  </SheetTitle>
                </SheetHeader>

                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"
                    >
                      <link.icon className="w-5 h-5 text-neutral-500" />
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {!user && (
                  <div className="mt-6 pt-6 border-t space-y-2">
                    <Button asChild variant="outline" className="w-full h-11">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Connexion
                      </Link>
                    </Button>
                    <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        S'inscrire
                      </Link>
                    </Button>
                  </div>
                )}

                {user && profile && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="px-3 py-3 bg-neutral-100 rounded-lg mb-4">
                      <p className="text-sm font-bold">{profile.company_name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <nav className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
                      >
                        <LayoutDashboard className="w-5 h-5 text-neutral-500" />
                        Tableau de bord
                      </Link>
                      <Link
                        href="/dashboard/messages"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
                      >
                        <Mail className="w-5 h-5 text-neutral-500" />
                        Messagerie
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

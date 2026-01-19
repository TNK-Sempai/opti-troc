import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LayoutDashboard, Package, LogOut, Search, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("user_profiles")
      .select("company_name, first_name, last_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-blue-200/60 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Image
                src="/opti-troc-logo.png"
                alt="Opti-Troc Logo"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                Opti-Troc
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                Marketplace B2B Optique
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 hover:scale-105"
            >
              Accueil
            </Link>
            <Link
              href="/shop"
              className="text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 hover:scale-105"
            >
              Marketplace
            </Link>
            <Link
              href="/want-to-buy"
              className="text-sm font-bold px-4 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 hover:scale-105"
            >
              Want to Buy
            </Link>
            <Link
              href="/about"
              className="text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 hover:scale-105"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 hover:scale-105"
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-11 px-4 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-2.5 shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:inline">
                      {profile.first_name} {profile.last_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-2 border-blue-200/60">
                  <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl mb-2">
                    <p className="text-sm font-bold text-blue-900">
                      {profile.company_name}
                    </p>
                    <p className="text-xs text-blue-700 font-medium">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-50 cursor-pointer py-2.5">
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-semibold">Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-50 cursor-pointer py-2.5">
                    <Link href="/dashboard/listings">
                      <Package className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-semibold">Mes annonces</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-emerald-50 cursor-pointer py-2.5">
                    <Link href="/dashboard/wanted-items">
                      <Search className="w-4 h-4 mr-3 text-emerald-600" />
                      <span className="font-semibold">Mes recherches</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-50 cursor-pointer py-2.5">
                    <Link href="/dashboard/messages">
                      <Mail className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-semibold">Messagerie</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-red-50 cursor-pointer py-2.5">
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-11 px-5 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:scale-105 transition-all duration-300 font-bold border border-transparent hover:border-blue-200">
                  <Link href="/login">
                    <User className="w-4 h-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-base"
                >
                  <Link href="/register">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

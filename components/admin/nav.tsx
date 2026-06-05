'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Mail,
  LogOut,
  User,
  ShieldCheck,
  ArrowLeftRight,
  Package,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AdminNavProps {
  profile: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

export function AdminNav({ profile }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function getUnreadCount() {
      const supabase = createClient();
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      setUnreadMessages(count || 0);
    }
    getUnreadCount();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const navItems = [
    {
      href: '/admin',
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/admin/users',
      label: 'Utilisateurs',
      icon: Users,
      badge: null,
    },
    {
      href: '/admin/messages',
      label: 'Messages',
      icon: Mail,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      href: '/admin/listings',
      label: 'Annonces',
      icon: Package,
      badge: null,
    },
  ];

  return (
    <header className="bg-pine-teal backdrop-blur-md border-b border-hunter-green sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <h1 className="text-xl font-bold text-white">Panel Admin</h1>
              </div>
              <p className="text-xs text-dry-sage">Gestion Opti-Troc</p>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={
                      isActive
                        ? 'bg-hunter-green text-white hover:bg-fern'
                        : 'text-dry-sage hover:text-white hover:bg-hunter-green'
                    }
                  >
                    <Link href={item.href}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-2 bg-gold text-pine-teal h-5 px-1.5 text-xs font-bold">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch vers dashboard user */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-dry-sage hover:text-white hover:bg-hunter-green border-0"
            >
              <Link href="/dashboard">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Mode utilisateur</span>
              </Link>
            </Button>

            {/* Menu profil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-hunter-green border-0"
                >
                  <div className="w-6 h-6 bg-fern rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:inline text-dust-grey">
                    {profile.first_name} {profile.last_name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{profile.company_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    Administrateur
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Mode utilisateur
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

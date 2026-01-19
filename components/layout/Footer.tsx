import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950 text-neutral-300 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Colonne 1: À propos */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white p-1.5 shadow-lg hover:scale-110 transition-transform duration-300">
                <Image
                  src="/opti-troc-logo.png"
                  alt="Opti-Troc Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Opti-Troc</h3>
                <p className="text-xs text-blue-300 font-semibold">Marketplace B2B Optique</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed font-medium">
              La plateforme de confiance pour les professionnels de l'optique. Achetez et vendez votre stock en toute sécurité.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/Proxxy.Diallo" target="_blank" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="https://x.com/TanukiSempai75" target="_blank"className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                <Twitter className="w-4 h-4 text-white" />
              </a>
              <a href="https://www.linkedin.com/in/meidhy-ali-oussalah-15a982229/" target="_blank" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a href="https://www.instagram.com/lass.tanukisempai" target="_blank" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                <Instagram className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 className="text-white font-extrabold mb-5 text-lg">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/want-to-buy" className="hover:text-emerald-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Want to Buy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Compte */}
          <div>
            <h4 className="text-white font-extrabold mb-5 text-lg">Mon compte</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/login" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/dashboard/listings" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Mes annonces
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wanted-items" className="hover:text-emerald-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Mes recherches
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Informations légales */}
          <div>
            <h4 className="text-white font-extrabold mb-5 text-lg">Informations légales</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/legal/terms" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Politique des cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/mentions" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv" className="hover:text-blue-300 hover:pl-2 transition-all duration-300 block font-medium">
                  CGV
                </Link>
              </li>
            </ul>
            <div className="mt-6 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-blue-400 hover:bg-white/10 transition-all duration-300">
              <a
                href="mailto:tanuki.corporation@gmail.com"
                className="flex items-center gap-2.5 text-sm hover:text-blue-300 transition-colors font-semibold"
              >
                <Mail className="w-4 h-4" />
                tanuki.corporation@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
            <p className="text-neutral-400 font-semibold">
              © {currentYear} Opti-Troc by Tanuki Sempaï. Tous droits réservés.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" />
              <p className="text-xs font-bold bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
                Plateforme B2B dédiée aux professionnels de l'optique
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

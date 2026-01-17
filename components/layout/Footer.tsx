import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Colonne 1: À propos */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white p-1">
                <Image
                  src="/opti-troc-logo.png"
                  alt="Opti-Troc Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Opti-Troc</h3>
                <p className="text-xs text-neutral-400">Marketplace B2B Optique</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              La plateforme de confiance pour les professionnels de l'optique. Achetez et vendez votre stock en toute sécurité.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/want-to-buy" className="hover:text-white transition-colors">
                  Want to Buy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Compte */}
          <div>
            <h4 className="text-white font-semibold mb-4">Mon compte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/dashboard/listings" className="hover:text-white transition-colors">
                  Mes annonces
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wanted-items" className="hover:text-white transition-colors">
                  Mes recherches
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Informations légales */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white transition-colors">
                  Politique des cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/mentions" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv" className="hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <a
                href="mailto:contact@opti-troc.fr"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@opti-troc.fr
              </a>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>
              © {currentYear} Opti-Troc. Tous droits réservés.
            </p>
            <p className="text-xs">
              Plateforme B2B dédiée aux professionnels de l'optique
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Linkedin, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const resetConsent = () => {
  localStorage.removeItem('cookie_consent')
  window.location.reload()
}

  return (
    <footer className="bg-pine-teal">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Colonne 1: Logo + Baseline */}
          <div>
            <div className="mb-5">
              <div className="relative w-16 h-16">
                <Image
                  src="/opti-troc-logo.png"
                  alt="Opti-Troc"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-dry-sage mb-5 leading-relaxed">
              Marketplace B2B pour professionnels de l'optique. Achetez et
              vendez votre stock en toute confiance.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/Proxxy.Diallo"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 bg-hunter-green rounded-md flex items-center justify-center hover:bg-fern transition-colors duration-200"
              >
                <Facebook className="w-4 h-4 text-dry-sage group-hover:text-white transition-colors duration-200" />
              </a>
              <a
                href="https://x.com/TanukiSempai75"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 bg-hunter-green rounded-md flex items-center justify-center hover:bg-fern transition-colors duration-200"
              >
                <Twitter className="w-4 h-4 text-dry-sage group-hover:text-white transition-colors duration-200" />
              </a>
              <a
                href="https://www.linkedin.com/in/meidhy-ali-oussalah-15a982229/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 bg-hunter-green rounded-md flex items-center justify-center hover:bg-fern transition-colors duration-200"
              >
                <Linkedin className="w-4 h-4 text-dry-sage group-hover:text-white transition-colors duration-200" />
              </a>
              <a
                href="https://www.instagram.com/lass.tanukisempai"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 bg-hunter-green rounded-md flex items-center justify-center hover:bg-fern transition-colors duration-200"
              >
                <Instagram className="w-4 h-4 text-dry-sage group-hover:text-white transition-colors duration-200" />
              </a>
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/want-to-buy"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Want to Buy
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Compte */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
              Mon compte
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/listings"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Mes annonces
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/wanted-items"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Mes recherches
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Informations legales */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
              Informations légales
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Politique des cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/mentions"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cgv"
                  className="text-dry-sage hover:text-white transition-colors duration-200"
                >
                  CGV
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre copyright */}
        <div className="border-t border-hunter-green pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-medium-grey">
            <p>
              &copy; {currentYear} Opti-Troc by Tanuki Sempai. Tous droits
              réservés.
            </p>
            <a
              href="mailto:tanuki.corporation@gmail.com"
              className="flex items-center gap-2 text-dry-sage hover:text-white transition-colors duration-200"
            >
              <Mail className="w-4 h-4" />
              tanuki.corporation@gmail.com
            </a>
            <button onClick={resetConsent}>
              Modifier mes préférences cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

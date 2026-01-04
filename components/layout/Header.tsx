import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary-dark">
          Opti-troc
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/listings" className="hover:text-primary">
            Annonces
          </Link>
          <Link href="/lots" className="hover:text-primary">
            Lots
          </Link>
          <Link href="/want-to-buy" className="hover:text-primary">
            Want to Buy
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="text-sm hover:text-primary"
          >
            Connexion
          </Link>
          <Link 
            href="/register"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </header>
  )
}
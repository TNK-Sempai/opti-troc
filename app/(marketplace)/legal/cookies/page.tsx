import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-pine-teal mb-3">Politique des Cookies</h1>
          <div className="w-12 h-1 bg-gold" />
        </div>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Qu'est-ce qu'un cookie ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site web.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Types de cookies utilisés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <h4 className="font-semibold text-charcoal">Cookies essentiels</h4>
            <p>Nécessaires au fonctionnement du site (authentification, sécurité)</p>

            <h4 className="font-semibold text-charcoal mt-4">Cookies analytiques</h4>
            <p>Permettent d'analyser l'utilisation du site pour l'améliorer</p>

            <h4 className="font-semibold text-charcoal mt-4">Cookies fonctionnels</h4>
            <p>Mémorisent vos préférences (langue, filtres, etc.)</p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Gestion des cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>Vous pouvez gérer vos préférences de cookies via :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Les paramètres de votre navigateur</li>
              <li>Notre bandeau de gestion des cookies</li>
            </ul>
          </CardContent>
        </Card>

        <p className="text-sm text-medium-grey mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  )
}

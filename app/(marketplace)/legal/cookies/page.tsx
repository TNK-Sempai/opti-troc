import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Politique des Cookies</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Qu'est-ce qu'un cookie ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site web.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Types de cookies utilisés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <h4 className="font-semibold">Cookies essentiels</h4>
          <p>Nécessaires au fonctionnement du site (authentification, sécurité)</p>

          <h4 className="font-semibold mt-4">Cookies analytiques</h4>
          <p>Permettent d'analyser l'utilisation du site pour l'améliorer</p>

          <h4 className="font-semibold mt-4">Cookies fonctionnels</h4>
          <p>Mémorisent vos préférences (langue, filtres, etc.)</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestion des cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>Vous pouvez gérer vos préférences de cookies via :</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Les paramètres de votre navigateur</li>
            <li>Notre bandeau de gestion des cookies</li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </p>
    </div>
  )
}

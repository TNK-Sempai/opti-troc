import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-pine-teal mb-3">Conditions Générales d'Utilisation</h1>
          <div className="w-12 h-1 bg-gold" />
        </div>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">1. Objet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
              de la plateforme Opti-Troc, marketplace B2B destinée aux professionnels de l'optique.
            </p>
            <p>
              L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">2. Accès à la plateforme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              La plateforme Opti-Troc est exclusivement réservée aux professionnels de l'optique
              justifiant d'une activité légale et régulière.
            </p>
            <p>
              L'inscription nécessite la fourniture de documents professionnels valides
              (SIRET, Kbis, carte professionnelle).
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">3. Création de compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Chaque utilisateur s'engage à fournir des informations exactes, complètes et à jour.
            </p>
            <p>
              Les identifiants de connexion sont personnels et confidentiels. L'utilisateur est
              responsable de leur sécurité.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">4. Utilisation de la plateforme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Les utilisateurs s'engagent à :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Respecter les lois et règlements en vigueur</li>
              <li>Publier des annonces conformes et véridiques</li>
              <li>Ne pas porter atteinte aux droits de tiers</li>
              <li>Ne pas détourner la plateforme de son usage</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">5. Responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Opti-Troc agit en tant qu'intermédiaire et ne peut être tenu responsable :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Des transactions effectuées entre professionnels</li>
              <li>De la qualité des produits vendus</li>
              <li>Des litiges entre acheteurs et vendeurs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">6. Modification des CGU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Opti-Troc se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés de toute modification significative.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-medium-grey mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  )
}

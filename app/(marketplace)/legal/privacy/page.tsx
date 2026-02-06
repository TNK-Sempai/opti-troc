import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-pine-teal mb-3">Politique de Confidentialité</h1>
          <div className="w-12 h-1 bg-gold" />
        </div>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Collecte des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Informations d'identification professionnelle (SIRET, raison sociale)</li>
              <li>Coordonnées (email, téléphone, adresse)</li>
              <li>Données de navigation et d'utilisation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Utilisation des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gérer votre compte et vos annonces</li>
              <li>Faciliter les transactions entre professionnels</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Vos droits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
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

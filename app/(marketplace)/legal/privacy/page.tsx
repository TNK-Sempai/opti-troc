import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Collecte des données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>Nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Informations d'identification professionnelle (SIRET, raison sociale)</li>
            <li>Coordonnées (email, téléphone, adresse)</li>
            <li>Données de navigation et d'utilisation</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Utilisation des données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Gérer votre compte et vos annonces</li>
            <li>Faciliter les transactions entre professionnels</li>
            <li>Améliorer nos services</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vos droits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
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

      <p className="text-sm text-muted-foreground mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </p>
    </div>
  )
}

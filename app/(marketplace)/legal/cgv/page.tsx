import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-pine-teal mb-3">Conditions Générales de Vente</h1>
          <div className="w-12 h-1 bg-gold" />
        </div>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">1. Objet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Les présentes CGV régissent les transactions entre professionnels sur la plateforme Opti-Troc.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">2. Rôle de la plateforme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Opti-Troc agit en tant qu'intermédiaire technique mettant en relation vendeurs et acheteurs.
              Les transactions sont conclues directement entre professionnels.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">3. Prix et paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Les prix sont fixés librement par les vendeurs et affichés en euros HT ou TTC.
              Les modalités de paiement sont définies entre les parties.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">4. Livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Les modalités de livraison (délais, frais, mode) sont à convenir entre acheteur et vendeur.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">5. Garanties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>
              Les garanties applicables sont celles prévues par le Code de commerce pour les ventes entre professionnels.
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

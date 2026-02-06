import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MentionsPage() {
  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-pine-teal mb-3">Mentions Légales</h1>
          <div className="w-12 h-1 bg-gold" />
        </div>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p><strong className="text-charcoal">Raison sociale :</strong> Opti-Troc SAS</p>
            <p><strong className="text-charcoal">Siège social :</strong> [Adresse à compléter]</p>
            <p><strong className="text-charcoal">SIRET :</strong> [À compléter]</p>
            <p><strong className="text-charcoal">Email :</strong> contact@opti-troc.fr</p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Directeur de publication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p>[Nom du directeur de publication]</p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-off-white border-light-grey">
          <CardHeader>
            <CardTitle className="text-pine-teal font-serif">Hébergement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-dark-grey">
            <p><strong className="text-charcoal">Hébergeur :</strong> Vercel Inc.</p>
            <p><strong className="text-charcoal">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
          </CardContent>
        </Card>

        <p className="text-sm text-medium-grey mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  )
}

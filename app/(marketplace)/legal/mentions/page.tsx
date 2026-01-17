import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MentionsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Éditeur du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><strong>Raison sociale :</strong> Opti-Troc SAS</p>
          <p><strong>Siège social :</strong> [Adresse à compléter]</p>
          <p><strong>SIRET :</strong> [À compléter]</p>
          <p><strong>Email :</strong> contact@opti-troc.fr</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Directeur de publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>[Nom du directeur de publication]</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hébergement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><strong>Hébergeur :</strong> Vercel Inc.</p>
          <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </p>
    </div>
  )
}

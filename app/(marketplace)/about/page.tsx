import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  TrendingUp,
  Package,
  MessageCircle,
  Award,
} from "lucide-react"

import { getPlatformStats } from "@/lib/stats"

export default async function AboutPage() {
  const stats = await getPlatformStats()

  return (
    <div className="min-h-screen bg-dust-grey">
      <div className="container mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pine-teal text-white">À propos</Badge>
          <h1 className="text-4xl font-serif font-bold mb-4 text-pine-teal">
            Opti-Troc
          </h1>
          <div className="w-12 h-1 bg-gold mx-auto mb-4" />
          <p className="text-xl text-dark-grey max-w-2xl mx-auto">
            La première marketplace B2B dédiée aux professionnels de l'optique
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8 shadow-lg bg-off-white border-light-grey">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pine-teal rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold mb-3 text-pine-teal">Notre Mission</h2>
                <p className="text-dark-grey leading-relaxed">
                  Opti-Troc est né d'une discussion entre deux anciens collègues,
                  aujourd'hui engagés dans des parcours professionnels différents.
                  En croisant nos expériences terrain et nos compétences
                  technologiques, nous avons voulu créer bien plus qu'un simple
                  espace d'achat-vente.
                  <br /><br />
                  Opti-Troc ambitionne de devenir le site de référence du monde
                  de l'optique : une plateforme communautaire, un annuaire
                  exhaustif et un outil métier pensé par et pour les
                  professionnels.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats réelles */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-md bg-off-white border-light-grey">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-pine-teal mx-auto mb-3" />
              <div className="text-3xl font-bold text-pine-teal mb-1">
                {stats.professionals}
              </div>
              <div className="text-sm text-medium-grey">
                Professionnels validés
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-off-white border-light-grey">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-fern mx-auto mb-3" />
              <div className="text-3xl font-bold text-fern mb-1">
                {stats.listings}
              </div>
              <div className="text-sm text-medium-grey">
                Annonces actives
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-off-white border-light-grey">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-3xl font-bold text-gold mb-1">
                {stats.satisfaction} / 5
              </div>
              <div className="text-sm text-medium-grey">
                Satisfaction moyenne
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement */}
        <Card className="shadow-lg bg-off-white border-light-grey">
          <CardContent className="p-8 text-center">
            <Award className="w-12 h-12 text-pine-teal mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3 text-pine-teal">Notre Engagement</h2>
            <p className="text-dark-grey max-w-2xl mx-auto">
              Une plateforme fiable, sécurisée et pensée pour durer.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

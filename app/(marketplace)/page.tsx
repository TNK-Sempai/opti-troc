export default function HomePage() {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Marketplace B2B pour opticiens professionnels
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Achetez et vendez du stock facilement entre professionnels
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
              Créer une annonce
            </button>
            <button className="px-8 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary/5 font-medium">
              Parcourir les annonces
            </button>
          </div>
          
          <div className="mt-12 p-6 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-lg font-semibold text-warning-dark">
              🎉 Offre de lancement
            </p>
            <p className="mt-2 text-neutral-700">
              1€/mois pendant 3 mois - Limité aux 2000 premiers inscrits
            </p>
          </div>
        </div>
      </div>
    )
  }
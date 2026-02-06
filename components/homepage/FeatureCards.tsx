'use client'

import { useEffect, useRef, useState } from 'react'
import { Zap, Shield, Users } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Rapide et efficace',
    description:
      'Publiez vos annonces en quelques clics et touchez des milliers de professionnels.',
  },
  {
    icon: Shield,
    title: '100% sécurisé',
    description:
      'Tous les comptes sont vérifiés. Transactions sécurisées entre professionnels.',
  },
  {
    icon: Users,
    title: 'Réseau pro',
    description:
      "Rejoignez une communauté exclusive de professionnels de l'optique.",
  },
]

export function FeatureCards() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-dust-grey py-20">
      <div className="container mx-auto px-4 max-w-6xl" ref={sectionRef}>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`bg-off-white border border-[#e8e4de] rounded-xl p-8 hover:border-fern hover:shadow-md transition-all duration-300 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={isVisible ? { animationDelay: `${index * 150}ms` } : undefined}
              >
                {/* Icone dans cercle vert sombre */}
                <div className="w-14 h-14 bg-pine-teal rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gold" />
                </div>

                {/* Titre */}
                <h3 className="font-serif text-xl font-semibold text-pine-teal mt-6">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#4a4a4a] mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const GA_ID = 'G-35NBENEDXF'

// Fonction utilitaire pour envoyer des événements
export const event = ({ action, category, label, value }: {
  action: string
  category?: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    })
  }
}

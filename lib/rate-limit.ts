/**
 * Rate limiting en mémoire, sans dépendance externe.
 *
 * LIMITES CONNUES — acceptables pour le lancement, à remplacer par un store
 * partagé (Redis/Upstash) si le trafic le justifie :
 *  - la Map vit dans le process : sur Vercel chaque instance a la sienne, donc
 *    la limite réelle est « max × nombre d'instances actives » ;
 *  - un cold start remet les compteurs à zéro ;
 *  - l'IP vient d'un header, qui peut être falsifié si la requête n'a pas
 *    traversé le proxy Vercel.
 * Ça freine le bourrinage naïf, ça n'arrête pas un attaquant déterminé.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Balayage des entrées expirées, au plus une fois par minute. */
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = 0

function cleanupExpired(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  /** Secondes restantes avant réinitialisation, pour le message d'erreur. */
  retryAfterSeconds: number
}

/**
 * @param identifier Clé du compteur. Préfixer par la route appelante pour que
 *                   deux limites différentes ne partagent pas le même seau :
 *                   `checkout:${ip}`, `messages:${ip}`…
 * @param max        Nombre de requêtes autorisées dans la fenêtre.
 * @param windowMs   Durée de la fenêtre en millisecondes.
 */
export function rateLimit(
  identifier: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  cleanupExpired(now)

  const bucket = buckets.get(identifier)

  // Pas de seau, ou fenêtre écoulée : on repart de zéro.
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: max - 1, retryAfterSeconds: 0 }
  }

  bucket.count += 1

  return {
    success: bucket.count <= max,
    remaining: Math.max(0, max - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

/**
 * IP du client derrière le proxy Vercel.
 *
 * NextRequest.ip n'existe plus depuis Next 15 : seuls les headers sont
 * disponibles. x-forwarded-for peut contenir une liste, le client réel est
 * la première entrée.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  return headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Message unique pour les réponses 429. */
export function tooManyRequestsMessage(retryAfterSeconds: number): string {
  return `Trop de requêtes. Réessayez dans ${retryAfterSeconds} secondes.`
}

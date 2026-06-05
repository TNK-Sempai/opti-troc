// Logger centralisé — silencieux en production, verbose en développement
// Prêt à être branché sur Sentry ou un service de monitoring

const isDev = process.env.NODE_ENV === 'development';

export function logError(context: string, error: unknown) {
  if (isDev) {
    console.error(`[${context}]`, error);
  }
  // En production : silencieux (brancher Sentry ici plus tard)
}

export function logInfo(context: string, ...args: unknown[]) {
  if (isDev) {
    console.log(`[${context}]`, ...args);
  }
}

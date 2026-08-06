import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ping quotidien de Supabase.
 *
 * Le plan gratuit met un projet en pause après 7 jours sans activité : une
 * requête légère suffit à réinitialiser ce compteur.
 *
 * Déclenché par le cron Vercel (voir vercel.json). Vercel envoie
 * automatiquement l'en-tête `Authorization: Bearer $CRON_SECRET` dès que la
 * variable CRON_SECRET est définie sur le projet.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  // Secret absent → on refuse, plutôt que de laisser la route ouverte.
  if (!cronSecret) {
    console.error('[cron.keep-alive] CRON_SECRET is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .limit(1)

  if (error) {
    // console.error et non logError : ce dernier est silencieux en production
    // (lib/logger.ts), or l'échec du ping doit être visible dans les logs.
    console.error('[cron.keep-alive] Supabase ping failed', error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}

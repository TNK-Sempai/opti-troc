import { supabaseAdmin } from '@/lib/supabase/admin'

/** Or Opti-Troc, pour la barre latérale de l'embed. */
const EMBED_COLOR = 0xd4af37

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  shop: 'Boutique',
  supplier: 'Fournisseur',
  fournisseur: 'Fournisseur',
}

const PLAN_LABELS: Record<string, string> = {
  early_bird: 'Early Bird — 3 € pour 3 mois',
  mensuel: 'Mensuel — 14,99 €/mois',
  annuel: 'Annuel — 129 €/an',
}

interface NotifyAdminNewUserArgs {
  userId: string
  /** Plan Stripe souscrit (early_bird | mensuel | annuel). */
  plan?: string | null
}

/**
 * Prévient les admins sur Discord qu'un compte attend leur validation.
 *
 * Ne lève jamais : une notification ratée ne doit pas faire échouer le
 * traitement du webhook Stripe qui l'a déclenchée.
 */
export async function notifyAdminNewUser({
  userId,
  plan,
}: NotifyAdminNewUserArgs): Promise<void> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      console.error(
        '[notifyAdminNewUser] DISCORD_WEBHOOK_URL non définie — notification ignorée',
        { userId }
      )
      return
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('company_name, account_type, contact_name')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)

    // Le reste du code écrit et lit 'official' (onboarding/actions.ts,
    // register/actions.ts, admin/users/[id]/page.tsx). 'company_proof' est
    // accepté en plus pour ne pas casser si le libellé change côté base.
    const { data: documents } = await supabaseAdmin
      .from('user_documents')
      .select('document_url')
      .eq('user_id', userId)
      .in('document_type', ['official', 'company_proof'])
      .order('created_at', { ascending: false })
      .limit(1)

    const documentUrl = documents?.[0]?.document_url

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const adminLink = `${appUrl}/admin/users/${userId}`

    const accountType = profile?.account_type ?? ''
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: '🔔 Nouveau compte en attente de validation',
            url: adminLink,
            color: EMBED_COLOR,
            fields: [
              {
                name: 'Entreprise',
                value: profile?.company_name || '—',
                inline: true,
              },
              {
                name: 'Contact',
                value: profile?.contact_name || '—',
                inline: true,
              },
              {
                name: 'Email',
                value: authUser?.user?.email || '—',
                inline: false,
              },
              {
                name: 'Type de compte',
                value: ACCOUNT_TYPE_LABELS[accountType] || accountType || '—',
                inline: true,
              },
              {
                name: 'Plan souscrit',
                value: plan ? PLAN_LABELS[plan] || plan : '—',
                inline: true,
              },
              {
                name: 'Document',
                // Lien masqué : supporté dans les champs d'embed Discord.
                value: documentUrl
                  ? `[Voir le document](${documentUrl})`
                  : 'Aucun document uploadé',
                inline: false,
              },
            ],
            footer: { text: 'Opti-Troc' },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5, // lien externe
                label: 'Ouvrir dans le panel admin',
                url: adminLink,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[notifyAdminNewUser] Discord a refusé la requête', {
        userId,
        status: response.status,
        body: await response.text().catch(() => '<illisible>'),
      })
    }
  } catch (error) {
    console.error('[notifyAdminNewUser] Envoi impossible', {
      userId,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

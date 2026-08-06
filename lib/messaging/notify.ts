import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY!)

/**
 * Si le destinataire a lu la conversation dans cette fenêtre, il est
 * considéré comme actif dedans : pas d'email.
 */
const RECENT_READ_WINDOW_MS = 2 * 60 * 1000

const MAX_EXCERPT_LENGTH = 50

/** Le contenu vient de l'utilisateur : on l'échappe avant de l'injecter dans le HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface NotifyNewMessageArgs {
  conversationId: string
  senderId: string
  content: string
}

/**
 * Prévient par email les autres participants d'une conversation.
 *
 * Ne lève jamais : une notification ratée ne doit pas faire échouer l'envoi
 * du message lui-même.
 */
export async function notifyNewMessage({
  conversationId,
  senderId,
  content,
}: NotifyNewMessageArgs): Promise<void> {
  try {
    const { data: participants } = await supabaseAdmin
      .from('conversation_participants')
      .select('user_id, last_read_at')
      .eq('conversation_id', conversationId)
      .neq('user_id', senderId)

    if (!participants?.length) return

    const { data: sender } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, last_name, company_name')
      .eq('id', senderId)
      .single()

    const senderName =
      [sender?.first_name, sender?.last_name].filter(Boolean).join(' ') ||
      sender?.company_name ||
      'Un membre'

    const trimmed = content.trim()
    const excerpt =
      trimmed.length > MAX_EXCERPT_LENGTH
        ? `${trimmed.slice(0, MAX_EXCERPT_LENGTH)}...`
        : trimmed

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const now = Date.now()

    for (const participant of participants) {
      // Destinataire actif dans la conversation → il voit déjà le message.
      if (
        participant.last_read_at &&
        now - new Date(participant.last_read_at).getTime() < RECENT_READ_WINDOW_MS
      ) {
        continue
      }

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        participant.user_id
      )
      const recipientEmail = authUser?.user?.email
      if (!recipientEmail) continue

      await resend.emails.send({
        from: `Opti-Troc <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: 'Vous avez reçu un nouveau message sur Opti-Troc',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; }
              .excerpt { background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a2332; font-style: italic; }
              .cta-box { text-align: center; margin: 28px 0; }
              .cta { display: inline-block; background: #1a2332; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #1a2332;">Nouveau message</h1>
              </div>

              <p><strong>${escapeHtml(senderName)}</strong> vous a envoyé un message sur Opti-Troc :</p>

              <div class="excerpt">${escapeHtml(excerpt)}</div>

              <div class="cta-box">
                <a href="${appUrl}/dashboard/messages" class="cta">Lire le message</a>
              </div>

              <div class="footer">
                <p>Opti-troc - Marketplace B2B pour opticiens professionnels</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    }
  } catch (error) {
    logError('notifyNewMessage', error)
  }
}

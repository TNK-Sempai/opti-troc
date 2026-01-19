import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, MailOpen, CheckCircle, Search, Inbox, Trash2, X } from 'lucide-react'
import { MessageQuickActions } from '@/components/admin/message-quick-actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
  search?: string
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  let query = supabaseAdmin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: messages } = await query

  let filteredMessages = messages || []
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredMessages = filteredMessages.filter(msg =>
      msg.name.toLowerCase().includes(searchLower) ||
      msg.email.toLowerCase().includes(searchLower) ||
      msg.subject.toLowerCase().includes(searchLower) ||
      (msg.company && msg.company.toLowerCase().includes(searchLower))
    )
  }

  const stats = {
    total: messages?.length || 0,
    new: messages?.filter(m => m.status === 'new').length || 0,
    read: messages?.filter(m => m.status === 'read').length || 0,
    replied: messages?.filter(m => m.status === 'replied').length || 0,
  }

  const currentStatus = params.status || 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/20 to-purple-50/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
                <Mail className="w-10 h-10 text-blue-600" />
                Messages
              </span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <form method="GET" className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
              <Input
                name="search"
                placeholder="Rechercher par nom, email, sujet..."
                defaultValue={params.search}
                className="pl-11 h-12 shadow-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
              />
            </form>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/messages?status=all"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'all'
                  ? 'bg-gradient-to-r from-neutral-700 to-neutral-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-neutral-200 hover:border-neutral-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Tous</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentStatus === 'all' ? 'bg-white/20 text-white border-0' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {stats.total}
              </Badge>
            </Link>

            <Link
              href="/admin/messages?status=new"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'new'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveaux</span>
              {stats.new > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'new'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {stats.new}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/messages?status=read"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'read'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <MailOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Lus</span>
              {stats.read > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'read'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {stats.read}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/messages?status=replied"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'replied'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Répondus</span>
              {stats.replied > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'replied'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {stats.replied}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        <Card className="shadow-xl border-blue-200/60 backdrop-blur-sm bg-white/95 overflow-hidden">
          <CardContent className="p-0">
            {filteredMessages && filteredMessages.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {filteredMessages.map((message) => {
                  const isNew = message.status === 'new'

                  return (
                    <div
                      key={message.id}
                      className={`p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300 border-l-4 ${
                        isNew ? 'bg-blue-50/30 border-l-blue-600' : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-5">
                        <div className="pt-2">
                          {isNew ? (
                            <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-lg animate-pulse" />
                          ) : (
                            <div className="w-3 h-3 bg-transparent" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-2">
                                <h3 className={`text-base truncate ${
                                  isNew ? 'font-bold bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent' : 'font-semibold text-neutral-800'
                                }`}>
                                  {message.name}
                                </h3>
                                {message.company && (
                                  <>
                                    <span className="text-neutral-300">•</span>
                                    <span className="text-sm text-muted-foreground truncate font-medium">
                                      {message.company}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className={`text-sm truncate mb-2 ${
                                isNew ? 'font-bold text-blue-700' : 'text-neutral-700 font-medium'
                              }`}>
                                {message.subject}
                              </p>
                              <p className="text-sm text-muted-foreground truncate font-medium">
                                {message.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-muted-foreground whitespace-nowrap font-semibold bg-neutral-100 px-3 py-1.5 rounded-lg">
                                {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <MessageQuickActions
                            message={{
                              id: message.id,
                              name: message.name,
                              email: message.email,
                              subject: message.subject,
                              status: message.status,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-neutral-50 opacity-50 rounded-xl" />
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-lg">
                    <Mail className="w-12 h-12 text-blue-600" />
                  </div>
                  <p className="text-neutral-700 font-bold mb-2 text-xl">
                    Aucun message
                  </p>
                  <p className="text-base text-muted-foreground font-medium">
                    {params.search || params.status !== 'all'
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Les nouveaux messages apparaîtront ici'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
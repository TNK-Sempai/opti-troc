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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Rechercher..."
              defaultValue={params.search}
              className="pl-10 h-11 shadow-sm"
            />
          </form>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link 
            href="/admin/messages?status=all"
            className={`px-4 h-11 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm ${
              currentStatus === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border hover:bg-neutral-50 hover:shadow-md'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span className="hidden sm:inline">Tous</span>
            <Badge variant="secondary" className={`h-5 px-2 text-xs ${
              currentStatus === 'all' ? 'bg-white/20 text-white' : ''
            }`}>
              {stats.total}
            </Badge>
          </Link>

          <Link 
            href="/admin/messages?status=new"
            className={`px-4 h-11 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm ${
              currentStatus === 'new'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border hover:bg-neutral-50 hover:shadow-md'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveaux</span>
            {stats.new > 0 && (
              <Badge className={`h-5 px-2 text-xs ${
                currentStatus === 'new' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {stats.new}
              </Badge>
            )}
          </Link>

          <Link 
            href="/admin/messages?status=read"
            className={`px-4 h-11 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm ${
              currentStatus === 'read'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white border hover:bg-neutral-50 hover:shadow-md'
            }`}
          >
            <MailOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Lus</span>
            {stats.read > 0 && (
              <Badge className={`h-5 px-2 text-xs ${
                currentStatus === 'read'
                  ? 'bg-white/20 text-white'
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                {stats.read}
              </Badge>
            )}
          </Link>

          <Link 
            href="/admin/messages?status=replied"
            className={`px-4 h-11 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm ${
              currentStatus === 'replied'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white border hover:bg-neutral-50 hover:shadow-md'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Répondus</span>
            {stats.replied > 0 && (
              <Badge className={`h-5 px-2 text-xs ${
                currentStatus === 'replied'
                  ? 'bg-white/20 text-white'
                  : 'bg-green-100 text-green-600'
              }`}>
                {stats.replied}
              </Badge>
            )}
          </Link>
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          {filteredMessages && filteredMessages.length > 0 ? (
            <div className="divide-y">
              {filteredMessages.map((message) => {
                const isNew = message.status === 'new'
                
                return (
                  <div
                    key={message.id}
                    className={`p-5 hover:bg-neutral-50 transition-colors ${
                      isNew ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1.5">
                        {isNew ? (
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm" />
                        ) : (
                          <div className="w-2.5 h-2.5 bg-transparent" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className={`text-sm truncate ${
                                isNew ? 'font-bold' : 'font-medium'
                              }`}>
                                {message.name}
                              </h3>
                              {message.company && (
                                <>
                                  <span className="text-neutral-300">·</span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {message.company}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className={`text-sm truncate mb-1.5 ${
                              isNew ? 'font-semibold text-primary' : 'text-neutral-700'
                            }`}>
                              {message.subject}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {message.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Boutons d'action */}
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
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">
                Aucun message
              </p>
              <p className="text-sm text-muted-foreground">
                {params.search || params.status !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les nouveaux messages apparaîtront ici'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateMessageStatus } from '@/lib/validations/query-params'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Mail, MailOpen, CheckCircle, Search, Inbox } from 'lucide-react'
import { MessageQuickActions } from '@/components/admin/message-quick-actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
  search?: string
  page?: string
  pageSize?: string
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

  const validStatus = validateMessageStatus(params.status);
  if (validStatus) {
    query = query.eq('status', validStatus)
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

  // Pagination
  const pageSizeVal = Math.min(parseInt(params.pageSize || '25') || 25, 100)
  const totalResults = filteredMessages.length
  const totalPages = Math.ceil(totalResults / pageSizeVal)
  const pageNum = Math.max(1, Math.min(parseInt(params.page || '1') || 1, totalPages || 1))
  const offsetVal = (pageNum - 1) * pageSizeVal
  const paginatedMessages = filteredMessages.slice(offsetVal, offsetVal + pageSizeVal)

  function buildUrl(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (params.status) base.status = params.status
    if (params.search) base.search = params.search
    base.pageSize = String(pageSizeVal)
    return `/admin/messages?${new URLSearchParams({ ...base, ...overrides }).toString()}`
  }

  const stats = {
    total: messages?.length || 0,
    new: messages?.filter(m => m.status === 'new').length || 0,
    read: messages?.filter(m => m.status === 'read').length || 0,
    replied: messages?.filter(m => m.status === 'replied').length || 0,
  }

  const currentStatus = params.status || 'all'

  return (
    <div className="min-h-screen bg-dust-grey relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              <span className="text-forest-gradient drop-shadow-sm flex items-center gap-3">
                <Mail className="w-10 h-10 text-pine-teal" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-pine-teal transition-colors" />
              <Input
                name="search"
                placeholder="Rechercher par nom, email, sujet..."
                defaultValue={params.search}
                className="pl-11 h-12 shadow-lg border-2 border-dry-sage focus:border-fern focus:ring-2 focus:ring-fern/20 font-medium"
              />
            </form>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/messages?status=all"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'all'
                  ? 'bg-gradient-to-r from-dark-grey to-charcoal text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-light-grey hover:border-medium-grey hover:shadow-lg hover:scale-105'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Tous</span>
              <Badge className={`h-5 px-2.5 text-xs font-bold ${
                currentStatus === 'all' ? 'bg-white/20 text-white border-0' : 'bg-dust-grey text-dark-grey'
              }`}>
                {stats.total}
              </Badge>
            </Link>

            <Link
              href="/admin/messages?status=new"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'new'
                  ? 'bg-gradient-to-r from-pine-teal to-hunter-green text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-dry-sage hover:border-fern/40 hover:shadow-lg hover:scale-105'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveaux</span>
              {stats.new > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'new'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-pine-teal/10 text-pine-teal'
                }`}>
                  {stats.new}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/messages?status=read"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'read'
                  ? 'bg-gradient-to-r from-gold to-gold-hover text-charcoal shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-dry-sage hover:border-gold/40 hover:shadow-lg hover:scale-105'
              }`}
            >
              <MailOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Lus</span>
              {stats.read > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'read'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-gold/10 text-gold'
                }`}>
                  {stats.read}
                </Badge>
              )}
            </Link>

            <Link
              href="/admin/messages?status=replied"
              className={`px-5 h-12 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ${
                currentStatus === 'replied'
                  ? 'bg-gradient-to-r from-fern to-hunter-green text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white border-2 border-fern/30 hover:border-fern/50 hover:shadow-lg hover:scale-105'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Répondus</span>
              {stats.replied > 0 && (
                <Badge className={`h-5 px-2.5 text-xs font-bold ${
                  currentStatus === 'replied'
                    ? 'bg-white/20 text-white border-0'
                    : 'bg-fern/10 text-fern'
                }`}>
                  {stats.replied}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white overflow-hidden">
          <CardContent className="p-0">
            {paginatedMessages && paginatedMessages.length > 0 ? (
              <div className="divide-y divide-light-grey">
                {paginatedMessages.map((message) => {
                  const isNew = message.status === 'new'

                  return (
                    <div
                      key={message.id}
                      className={`p-6 hover:bg-gradient-to-r hover:from-pine-teal/5 hover:to-transparent transition-all duration-300 border-l-4 ${
                        isNew ? 'bg-pine-teal/5 border-l-pine-teal' : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-5">
                        <div className="pt-2">
                          {isNew ? (
                            <div className="w-3 h-3 bg-gradient-to-br from-gold to-gold-hover rounded-full shadow-lg animate-pulse" />
                          ) : (
                            <div className="w-3 h-3 bg-transparent" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-2">
                                <h3 className={`text-base truncate ${
                                  isNew ? 'font-bold text-pine-teal' : 'font-semibold text-charcoal'
                                }`}>
                                  {message.name}
                                </h3>
                                {message.company && (
                                  <>
                                    <span className="text-dry-sage">•</span>
                                    <span className="text-sm text-muted-foreground truncate font-medium">
                                      {message.company}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className={`text-sm truncate mb-2 ${
                                isNew ? 'font-bold text-pine-teal' : 'text-dark-grey font-medium'
                              }`}>
                                {message.subject}
                              </p>
                              <p className="text-sm text-muted-foreground truncate font-medium">
                                {message.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-muted-foreground whitespace-nowrap font-semibold bg-dust-grey px-3 py-1.5 rounded-lg">
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
                <div className="absolute inset-0 bg-pine-teal/5 opacity-50 rounded-xl" />
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-pine-teal/10 rounded-3xl flex items-center justify-center shadow-lg">
                    <Mail className="w-12 h-12 text-pine-teal" />
                  </div>
                  <p className="text-dark-grey font-bold mb-2 text-xl">
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

        {/* Pagination */}
        {totalResults > 0 && (
          <Card className="shadow-xl border-dry-sage/40 backdrop-blur-sm bg-off-white mt-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  {[25, 50, 100].map(size => (
                    <Button
                      key={size}
                      asChild
                      variant={pageSizeVal === size ? 'default' : 'outline'}
                      size="sm"
                      className={pageSizeVal === size
                        ? 'bg-pine-teal text-white hover:bg-hunter-green font-bold'
                        : 'border-dry-sage hover:border-fern hover:text-pine-teal font-semibold'}
                    >
                      <Link href={buildUrl({ pageSize: String(size), page: '1' })}>{size}</Link>
                    </Button>
                  ))}
                  <span className="text-sm text-muted-foreground font-medium ml-1">par page</span>
                </div>

                <p className="text-sm font-semibold text-muted-foreground">
                  <span className="text-charcoal">{offsetVal + 1}-{Math.min(offsetVal + pageSizeVal, totalResults)}</span> sur{' '}
                  <span className="text-charcoal">{totalResults}</span>
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {pageNum > 1 && (
                      <Button asChild variant="outline" size="sm" className="border-dry-sage hover:border-fern hover:text-pine-teal font-semibold">
                        <Link href={buildUrl({ page: String(pageNum - 1) })}><ChevronLeft className="w-4 h-4" /></Link>
                      </Button>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let p = i + 1
                      if (totalPages > 5 && pageNum > 3) {
                        p = pageNum - 2 + i
                        if (p > totalPages) p = totalPages - (4 - i)
                      }
                      return (
                        <Button
                          key={p}
                          asChild
                          variant={p === pageNum ? 'default' : 'ghost'}
                          size="sm"
                          className={p === pageNum
                            ? 'w-9 bg-pine-teal text-white hover:bg-hunter-green font-bold'
                            : 'w-9 hover:bg-dust-grey hover:text-pine-teal font-semibold'}
                        >
                          <Link href={buildUrl({ page: String(p) })}>{p}</Link>
                        </Button>
                      )
                    })}
                    {pageNum < totalPages && (
                      <Button asChild variant="outline" size="sm" className="border-dry-sage hover:border-fern hover:text-pine-teal font-semibold">
                        <Link href={buildUrl({ page: String(pageNum + 1) })}><ChevronRight className="w-4 h-4" /></Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

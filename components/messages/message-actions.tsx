'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MoreVertical, Mail, MailOpen, CheckCircle, Trash2, ExternalLink, User, Building2, Calendar, Eye } from 'lucide-react'
import { useState } from 'react'
import { updateMessageStatus, deleteMessage } from '@/app/actions/messages'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  name: string
  email: string
  company: string | null
  subject: string
  message: string
  status: string
  created_at: string
}

interface MessageActionsProps {
  message: Message
}

export function MessageActions({ message }: MessageActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setIsLoading(true)
    await updateMessageStatus(message.id, newStatus)
    router.refresh()
    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return
    setIsLoading(true)
    await deleteMessage(message.id)
    router.refresh()
    setIsLoading(false)
    setIsDialogOpen(false)
  }

  async function handleReply() {
    // Marquer comme lu si nouveau
    if (message.status === 'new') {
      await handleStatusChange('read')
    }
    // Ouvrir le client email
    window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, '_blank')
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'Nouveau', color: 'bg-pine-teal' },
    read: { label: 'Lu', color: 'bg-yellow-600' },
    replied: { label: 'Répondu', color: 'bg-green-600' }
  }

  const statusInfo = statusLabels[message.status]

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            Voir
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">{message.subject}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Badge className={`${statusInfo.color} text-white`}>
                    {statusInfo.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Separator className="my-4" />

          {/* Informations expéditeur */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{message.name}</p>
                <a href={`mailto:${message.email}`} className="text-sm text-primary hover:underline">
                  {message.email}
                </a>
              </div>
            </div>

            {message.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{message.company}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Message */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Message</h4>
            <div className="bg-dust-grey rounded-lg p-4 border">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReply}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-primary-dark"
              >
                <Mail className="w-4 h-4 mr-2" />
                Répondre par email
              </Button>

              {message.status !== 'replied' && (
                <Button
                  onClick={() => handleStatusChange('replied')}
                  disabled={isLoading}
                  variant="outline"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer répondu
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" disabled={isLoading}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {message.status === 'new' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('read')}>
                    <MailOpen className="w-4 h-4 mr-2" />
                    Marquer comme lu
                  </DropdownMenuItem>
                )}
                {message.status === 'read' && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('new')}>
                      <Mail className="w-4 h-4 mr-2" />
                      Marquer comme nouveau
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('replied')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer comme répondu
                    </DropdownMenuItem>
                  </>
                )}
                {message.status === 'replied' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('read')}>
                    <MailOpen className="w-4 h-4 mr-2" />
                    Marquer comme non répondu
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
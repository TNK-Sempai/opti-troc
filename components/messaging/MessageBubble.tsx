'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MessageBubbleProps {
  content: string
  timestamp: string
  isOwn: boolean
  senderName?: string
  senderInitials?: string
  showAvatar?: boolean
  showTimestamp?: boolean
}

export function MessageBubble({
  content,
  timestamp,
  isOwn,
  senderName,
  senderInitials,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-0.5`}>
      <div
        className={`flex items-end gap-2 max-w-[75%] ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        {showAvatar ? (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
              isOwn
                ? 'bg-pine-teal text-white'
                : 'bg-fern/15 text-fern'
            }`}
          >
            {senderInitials || '?'}
          </div>
        ) : (
          <div className="w-8 flex-shrink-0" />
        )}

        <div className={isOwn ? 'items-end' : 'items-start'}>
          {/* Sender name */}
          {!isOwn && senderName && showAvatar && (
            <p className="text-[11px] text-medium-grey font-semibold mb-1 ml-1">
              {senderName}
            </p>
          )}

          {/* Bubble */}
          <div
            className={`px-4 py-2.5 ${
              isOwn
                ? 'bg-pine-teal text-white rounded-2xl rounded-br-md'
                : 'bg-white text-charcoal rounded-2xl rounded-bl-md shadow-sm border border-light-grey/50'
            }`}
          >
            <p className="text-[13.5px] whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </p>
          </div>

          {/* Timestamp */}
          {showTimestamp && (
            <p
              className={`text-[10px] text-medium-grey/70 mt-1 mb-2 ${
                isOwn ? 'text-right mr-1' : 'ml-1'
              }`}
            >
              {format(new Date(timestamp), 'HH:mm', { locale: fr })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

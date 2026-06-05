'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logError } from '@/lib/logger';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Info, Send, Loader2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { ConversationData, MessageData } from './types';

interface ConversationViewProps {
  conversation: ConversationData;
  currentUserId: string;
  onInfoClick: () => void;
  onBack: () => void;
  onMessageActivity: () => void;
}

function getInitials(profile: ConversationData['otherParticipant']): string {
  if (!profile) return '?';
  return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '?';
}

function getListingInfo(conv: ConversationData) {
  if (!conv.listings) return { title: null, photo: null };
  if (conv.listings.listing_type === 'unit') {
    const unit = conv.listings.unit_listings?.[0];
    return {
      title: unit ? `${unit.brand} ${unit.model}`.trim() : null,
      photo: unit?.photos?.[0] || null,
      reference: unit?.reference || null,
    };
  }
  const lot = conv.listings.lot_listings?.[0];
  return {
    title: lot?.description?.slice(0, 60) || 'Lot',
    photo: lot?.photos?.[0] || null,
    reference: null,
  };
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
}

interface GroupedItem {
  type: 'date' | 'message';
  date?: Date;
  message?: MessageData;
  showAvatar: boolean;
  showTimestamp: boolean;
}

export function ConversationView({
  conversation,
  currentUserId,
  onInfoClick,
  onBack,
  onMessageActivity,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        logError('ConversationView', res.status);
      }
    } catch (e) {
      logError('ConversationView', e);
    }
    setLoading(false);
  }, [conversation.id]);

  // Load messages + subscribe to real-time
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();

    const channel = supabase
      .channel(`conv-view:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => {
          loadMessages();
          onMessageActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (!loading) {
      setTimeout(scrollToBottom, 60);
    }
  }, [messages, loading, scrollToBottom]);

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }

  async function handleSend() {
    if (!content.trim() || sending) return;
    setSending(true);
    const messageContent = content.trim();
    setContent('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: messageContent }),
    });

    if (!res.ok) {
      setContent(messageContent);
    } else {
      await loadMessages();
      onMessageActivity();
    }
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const participant = conversation.otherParticipant;
  const { title: listingTitle, photo: listingPhoto, reference } = getListingInfo(conversation);

  // Group messages by date and sender
  const grouped: GroupedItem[] = [];
  let lastDate: string | null = null;
  let lastSenderId: string | null = null;

  messages.forEach((msg, i) => {
    const msgDate = new Date(msg.created_at);
    const dateStr = format(msgDate, 'yyyy-MM-dd');

    if (dateStr !== lastDate) {
      grouped.push({ type: 'date', date: msgDate, showAvatar: false, showTimestamp: false });
      lastDate = dateStr;
      lastSenderId = null;
    }

    const nextMsg = messages[i + 1];
    const isLastInGroup =
      !nextMsg ||
      nextMsg.sender_id !== msg.sender_id ||
      new Date(nextMsg.created_at).getTime() - msgDate.getTime() > 5 * 60 * 1000;

    const isFirstInGroup = msg.sender_id !== lastSenderId;

    grouped.push({
      type: 'message',
      message: msg,
      showAvatar: isFirstInGroup,
      showTimestamp: isLastInGroup,
    });

    lastSenderId = msg.sender_id;
  });

  return (
    <div className="h-full flex flex-col bg-dust-grey/20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-off-white border-b border-light-grey/50 flex-shrink-0">
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-2 hover:bg-dust-grey/50 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-dark-grey" />
        </button>

        {participant?.profile_photo_url ? (
          <img
            src={participant.profile_photo_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-light-grey/50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-pine-teal/15 to-fern/15 text-pine-teal flex-shrink-0">
            {getInitials(participant)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold text-charcoal text-sm truncate">
            {participant
              ? participant.company_name || `${participant.first_name} ${participant.last_name}`
              : 'Conversation'}
          </p>
          {participant?.company_name && (
            <p className="text-[11px] text-medium-grey truncate">
              {participant.first_name} {participant.last_name}
            </p>
          )}
        </div>

        <button
          onClick={onInfoClick}
          className="p-2.5 hover:bg-dust-grey/50 rounded-xl transition-colors"
        >
          <Info className="w-5 h-5 text-dark-grey" />
        </button>
      </div>

      {/* Listing card (if applicable) */}
      {conversation.listings && (
        <div className="px-4 py-3 bg-off-white border-b border-light-grey/40 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-dust-grey/30 rounded-xl">
            {listingPhoto ? (
              <img
                src={listingPhoto}
                alt={listingTitle || ''}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-light-grey/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-dry-sage/15 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-dry-sage/60" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-charcoal truncate">
                {listingTitle || conversation.subject || 'Annonce'}
              </p>
              {reference && (
                <p className="text-[11px] text-medium-grey font-mono">Réf: {reference}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-gold">
                {conversation.listings.price?.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pine-teal/30 mx-auto mb-3" />
              <p className="text-xs text-medium-grey">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-pine-teal/8 rounded-2xl flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-pine-teal/30 -rotate-45" />
            </div>
            <p className="text-medium-grey font-medium text-sm mb-1">Aucun message</p>
            <p className="text-medium-grey/60 text-xs">
              Envoyez le premier message pour commencer la conversation
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {grouped.map((item, i) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${i}`} className="flex justify-center py-4">
                    <span className="text-[11px] text-medium-grey/70 bg-off-white/90 px-3.5 py-1 rounded-full font-medium shadow-sm border border-light-grey/30">
                      {formatDateSeparator(item.date!)}
                    </span>
                  </div>
                );
              }

              const msg = item.message!;
              const isOwn = msg.sender_id === currentUserId;
              const sender = msg.sender || participant;

              return (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  timestamp={msg.created_at}
                  isOwn={isOwn}
                  senderName={
                    !isOwn && sender
                      ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim()
                      : undefined
                  }
                  senderInitials={
                    sender
                      ? `${sender.first_name?.[0] || ''}${sender.last_name?.[0] || ''}`.toUpperCase()
                      : '?'
                  }
                  showAvatar={item.showAvatar}
                  showTimestamp={item.showTimestamp}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="flex-shrink-0 bg-off-white border-t border-light-grey/50 p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={content}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message..."
              rows={1}
              className="w-full px-4 py-3 bg-dust-grey/30 rounded-2xl text-sm resize-none border-0 focus:outline-none focus:ring-2 focus:ring-pine-teal/20 placeholder:text-medium-grey/60 transition-shadow"
              style={{ minHeight: '44px' }}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="w-11 h-11 bg-pine-teal text-white rounded-xl flex items-center justify-center hover:bg-hunter-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
          >
            {sending ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Send className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-medium-grey/50 text-center mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Pour votre sécurité, communiquez uniquement via Opti-Troc
        </p>
      </div>
    </div>
  );
}

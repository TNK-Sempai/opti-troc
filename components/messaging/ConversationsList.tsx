'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, MessageSquare } from 'lucide-react';
import type { ConversationData } from './types';

interface ConversationsListProps {
  conversations: ConversationData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  currentUserId: string;
}

function getInitials(profile: ConversationData['otherParticipant']): string {
  if (!profile) return '?';
  return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '?';
}

function getListingInfo(conv: ConversationData) {
  if (!conv.listings) return { title: null, photo: null };
  const listing = conv.listings;
  if (listing.listing_type === 'unit') {
    const unit = listing.unit_listings?.[0];
    return {
      title: unit ? `${unit.brand} ${unit.model}`.trim() : null,
      photo: unit?.photos?.[0] || null,
    };
  }
  const lot = listing.lot_listings?.[0];
  return {
    title: lot ? lot.description?.slice(0, 40) || 'Lot' : null,
    photo: lot?.photos?.[0] || null,
  };
}

export function ConversationsList({
  conversations,
  selectedId,
  onSelect,
  loading,
  currentUserId,
}: ConversationsListProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? conversations.filter((c) => {
        const name = c.otherParticipant
          ? `${c.otherParticipant.first_name} ${c.otherParticipant.last_name}`
          : '';
        const lowerSearch = search.toLowerCase();
        return (
          name.toLowerCase().includes(lowerSearch) ||
          c.subject?.toLowerCase().includes(lowerSearch) ||
          c.lastMessage?.content?.toLowerCase().includes(lowerSearch)
        );
      })
    : conversations;

  // Skeleton loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-off-white">
        <div className="p-5 border-b border-light-grey/50">
          <h2 className="text-xl font-bold text-charcoal mb-3">Messages</h2>
          <div className="h-10 bg-dust-grey/40 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 animate-pulse">
              <div className="w-12 h-12 bg-dry-sage/20 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-3.5 bg-dry-sage/20 rounded-full w-2/3" />
                <div className="h-3 bg-dry-sage/15 rounded-full w-full" />
                <div className="h-2.5 bg-dry-sage/10 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-off-white">
      {/* Header + search */}
      <div className="p-5 border-b border-light-grey/50 flex-shrink-0">
        <h2 className="text-xl font-bold text-charcoal mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-grey" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2.5 bg-dust-grey/40 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-pine-teal/20 placeholder:text-medium-grey/70 transition-shadow"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-pine-teal/8 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-pine-teal/40" />
            </div>
            <p className="text-medium-grey font-medium text-sm">
              {search ? 'Aucun résultat' : 'Aucune conversation'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((conv) => {
              const isSelected = conv.id === selectedId;
              const hasUnread = conv.unreadCount > 0;
              const participant = conv.otherParticipant;
              const { title: listingTitle, photo: listingPhoto } = getListingInfo(conv);

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-light-grey/30 transition-all duration-150 ${
                    isSelected
                      ? 'bg-pine-teal/[0.07] border-l-[3px] border-l-pine-teal'
                      : 'border-l-[3px] border-l-transparent hover:bg-dust-grey/30'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    {participant?.profile_photo_url ? (
                      <img
                        src={participant.profile_photo_url}
                        alt={`${participant.first_name} ${participant.last_name}`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm border border-light-grey/50"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${
                          hasUnread
                            ? 'bg-gradient-to-br from-pine-teal to-hunter-green text-white'
                            : 'bg-dry-sage/25 text-dark-grey'
                        }`}
                      >
                        {getInitials(participant)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p
                          className={`text-sm truncate ${
                            hasUnread ? 'font-bold text-charcoal' : 'font-semibold text-dark-grey'
                          }`}
                        >
                          {participant
                            ? participant.company_name ||
                              `${participant.first_name} ${participant.last_name}`
                            : 'Utilisateur'}
                        </p>
                        <span className="text-[11px] text-medium-grey/70 flex-shrink-0 ml-2 font-medium">
                          {conv.last_message_at &&
                            formatDistanceToNow(new Date(conv.last_message_at), {
                              addSuffix: false,
                              locale: fr,
                            })}
                        </span>
                      </div>

                      {participant?.company_name && (
                        <p className="text-[11px] text-dry-sage truncate mb-0.5 font-medium">
                          {participant.first_name} {participant.last_name}
                        </p>
                      )}

                      {/* Last message preview */}
                      <p
                        className={`text-xs truncate ${
                          hasUnread ? 'text-charcoal font-medium' : 'text-medium-grey'
                        }`}
                      >
                        {conv.lastMessage?.sender_id === currentUserId && (
                          <span className="text-dry-sage">Vous : </span>
                        )}
                        {conv.lastMessage?.content || conv.subject || 'Nouvelle conversation'}
                      </p>

                      {/* Listing mini-preview */}
                      {(listingTitle || conv.listings) && (
                        <div className="flex items-center gap-2 mt-2">
                          {listingPhoto && (
                            <img
                              src={listingPhoto}
                              alt=""
                              className="w-8 h-8 rounded-md object-cover flex-shrink-0 border border-light-grey/50"
                            />
                          )}
                          {listingTitle && (
                            <span className="text-[11px] text-dark-grey truncate font-medium">
                              {listingTitle}
                            </span>
                          )}
                          {conv.listings?.price != null && (
                            <span className="text-[11px] font-bold text-gold flex-shrink-0 ml-auto">
                              {conv.listings.price.toLocaleString('fr-FR')} €
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Unread badge */}
                    {hasUnread && (
                      <div className="flex-shrink-0 self-start mt-1">
                        <span className="min-w-[20px] h-5 bg-pine-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

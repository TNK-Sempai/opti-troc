export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  company_name: string | null
  profile_photo_url: string | null
}

export interface ListingData {
  id: string
  listing_type: 'unit' | 'lot'
  status: string
  price: number
  unit_listings: Array<{
    brand: string
    model: string
    reference?: string
    photos?: string[]
    condition?: string
  }>
  lot_listings: Array<{
    description: string
    photos?: string[]
    quantity?: number
    unit_price?: number
  }>
}

export interface ConversationData {
  id: string
  subject: string | null
  listing_id: string | null
  last_message_at: string
  created_at: string
  listings: ListingData | null
  otherParticipant: UserProfile | null
  lastMessage: {
    id: string
    content: string
    created_at: string
    sender_id: string
  } | null
  unreadCount: number
}

export interface MessageData {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: UserProfile
}

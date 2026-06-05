// Whitelists de valeurs autorisées pour les paramètres URL
// Empêche l'injection de valeurs arbitraires dans les requêtes Supabase

export const VALID_LISTING_STATUS = ['active', 'pending', 'suspended', 'sold'] as const;
export const VALID_LISTING_TYPES = ['unit', 'lot'] as const;
export const VALID_USER_STATUS = ['validated', 'pending', 'suspended'] as const;
export const VALID_MESSAGE_STATUS = ['new', 'read'] as const;

export type ListingStatus = (typeof VALID_LISTING_STATUS)[number];
export type ListingType = (typeof VALID_LISTING_TYPES)[number];
export type UserStatus = (typeof VALID_USER_STATUS)[number];
export type MessageStatus = (typeof VALID_MESSAGE_STATUS)[number];

export function validateListingStatus(value: string | undefined): ListingStatus | undefined {
  if (!value || value === 'all') return undefined;
  return VALID_LISTING_STATUS.includes(value as ListingStatus) ? (value as ListingStatus) : undefined;
}

export function validateListingType(value: string | undefined): ListingType | undefined {
  if (!value || value === 'all') return undefined;
  return VALID_LISTING_TYPES.includes(value as ListingType) ? (value as ListingType) : undefined;
}

export function validateUserStatus(value: string | undefined): UserStatus | undefined {
  if (!value || value === 'all') return undefined;
  return VALID_USER_STATUS.includes(value as UserStatus) ? (value as UserStatus) : undefined;
}

export function validateMessageStatus(value: string | undefined): MessageStatus | undefined {
  if (!value || value === 'all') return undefined;
  return VALID_MESSAGE_STATUS.includes(value as MessageStatus) ? (value as MessageStatus) : undefined;
}

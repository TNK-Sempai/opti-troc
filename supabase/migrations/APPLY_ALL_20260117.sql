-- =====================================================
-- SCRIPT DE MIGRATION CONSOLIDÉ - 2026-01-17
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- =====================================================
-- 1. FIX WANTED ITEMS TRIGGER
-- =====================================================
-- Fix the trigger to use correct column name and trigger on unit_listings instead of listings
-- This ensures the unit_listings record exists before we try to match against wanted items

-- Drop both old and new triggers if they exist
DROP TRIGGER IF EXISTS listings_notify_wanted_matches ON listings;
DROP TRIGGER IF EXISTS unit_listings_notify_wanted_matches ON unit_listings;

-- Create new function that triggers on unit_listings
CREATE OR REPLACE FUNCTION notify_wanted_item_matches()
RETURNS TRIGGER AS $$
DECLARE
  listing_status VARCHAR(50);
  listing_user_id UUID;
BEGIN
  -- Get the listing information
  SELECT status, user_id INTO listing_status, listing_user_id
  FROM listings
  WHERE id = NEW.listing_id;

  -- Only process active listings
  IF listing_status = 'active' THEN
    -- Insert notifications for matching wanted items
    INSERT INTO wanted_item_notifications (wanted_item_id, listing_id, user_id)
    SELECT
      wi.id,
      NEW.listing_id,
      wi.user_id
    FROM wanted_items wi
    WHERE wi.status = 'active'
      AND wi.user_id != listing_user_id  -- Don't notify the seller
      AND (
        -- Match by reference (most specific)
        (wi.reference IS NOT NULL AND wi.reference != '' AND NEW.reference ILIKE wi.reference)
        OR
        -- Match by brand and model
        (NEW.brand ILIKE wi.brand AND (wi.model IS NULL OR wi.model = '' OR NEW.model ILIKE wi.model))
      )
      AND (wi.max_price IS NULL OR NEW.price <= wi.max_price)
    ON CONFLICT (wanted_item_id, listing_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on unit_listings instead (after insert or update)
CREATE TRIGGER unit_listings_notify_wanted_matches
  AFTER INSERT OR UPDATE ON unit_listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_wanted_item_matches();

-- =====================================================
-- 2. ADD ARCHIVE COLUMNS TO CONTACT MESSAGES
-- =====================================================
-- Add archive-related columns to contact_messages table for legal compliance (5-year retention)

ALTER TABLE contact_messages
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS archive_expiry TIMESTAMPTZ;

-- Create index for archive expiry to facilitate cleanup queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_archive_expiry
ON contact_messages(archive_expiry)
WHERE archive_expiry IS NOT NULL;

-- Create index for archived status
CREATE INDEX IF NOT EXISTS idx_contact_messages_archived
ON contact_messages(status)
WHERE status = 'archived';

-- =====================================================
-- 3. FIX MESSAGING RLS RECURSION
-- =====================================================
-- Fix infinite recursion in messaging RLS policies
-- Use SECURITY DEFINER functions to break the recursion cycle

-- Create helper function to check if user is in conversation (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION user_in_conversation(conv_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
    AND user_id = user_uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop all problematic policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;

-- Recreate conversations policies using the helper function
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_in_conversation(id, auth.uid()));

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_in_conversation(id, auth.uid()));

-- Recreate conversation_participants policy
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_in_conversation(conversation_id, auth.uid()));

-- Recreate messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (user_in_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    user_in_conversation(conversation_id, auth.uid())
  );

-- =====================================================
-- 4. ADD USER ARCHIVE FUNCTIONALITY
-- =====================================================
-- Add archive functionality for users (5-year retention for GDPR compliance)
-- Users who request account deletion will be archived instead

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS archive_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Create index for archived users
CREATE INDEX IF NOT EXISTS idx_user_profiles_archived
ON user_profiles(status)
WHERE status = 'archived';

CREATE INDEX IF NOT EXISTS idx_user_profiles_archive_expiry
ON user_profiles(archive_expiry)
WHERE archive_expiry IS NOT NULL;

-- Add 'archived' to valid status values (informational comment)
-- Valid statuses: 'incomplete', 'pending', 'validated', 'rejected', 'suspended', 'archived'

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Toutes les migrations ont été appliquées avec succès!

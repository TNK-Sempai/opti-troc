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

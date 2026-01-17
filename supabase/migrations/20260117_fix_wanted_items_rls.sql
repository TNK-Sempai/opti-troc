-- Fix RLS policies for wanted_items table to allow public read access
-- This migration fixes the "Error fetching wanted items: {}" issue on /want-to-buy

-- First, verify the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'wanted_items') THEN
        RAISE EXCEPTION 'Table wanted_items does not exist';
    END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can view active wanted items" ON wanted_items;
DROP POLICY IF EXISTS "Users can view all wanted items" ON wanted_items;
DROP POLICY IF EXISTS "Users can view own wanted items" ON wanted_items;

-- Enable RLS on wanted_items (if not already enabled)
ALTER TABLE wanted_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active wanted items
CREATE POLICY "Public can view active wanted items"
ON wanted_items
FOR SELECT
TO public
USING (status = 'active');

-- Create policy for authenticated users to view all their own wanted items (any status)
CREATE POLICY "Users can view own wanted items"
ON wanted_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for users to insert their own wanted items
CREATE POLICY "Users can create own wanted items"
ON wanted_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own wanted items
CREATE POLICY "Users can update own wanted items"
ON wanted_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own wanted items
CREATE POLICY "Users can delete own wanted items"
ON wanted_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify we have some active wanted items (for debugging)
DO $$
DECLARE
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO item_count FROM wanted_items WHERE status = 'active';
    RAISE NOTICE 'Found % active wanted items', item_count;

    IF item_count = 0 THEN
        RAISE WARNING 'No active wanted items found in database. The /want-to-buy page will show empty results.';
    END IF;
END $$;

-- Display all policies for wanted_items (for verification)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'wanted_items'
ORDER BY policyname;

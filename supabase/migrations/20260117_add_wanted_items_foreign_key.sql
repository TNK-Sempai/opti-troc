-- Add foreign key relationship between wanted_items and user_profiles
-- This fixes the error: "Could not find a relationship between 'wanted_items' and 'user_profiles'"

-- First verify the wanted_items table structure
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'wanted_items' AND column_name = 'user_id'
    ) THEN
        RAISE EXCEPTION 'Column user_id does not exist in wanted_items table';
    END IF;
END $$;

-- Drop the constraint if it already exists (to avoid errors on re-run)
ALTER TABLE wanted_items
DROP CONSTRAINT IF EXISTS wanted_items_user_id_fkey;

-- Add foreign key constraint to user_profiles
ALTER TABLE wanted_items
ADD CONSTRAINT wanted_items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_wanted_items_user_id
ON wanted_items(user_id);

-- Verify the relationship was created
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'wanted_items'
    AND kcu.column_name = 'user_id';

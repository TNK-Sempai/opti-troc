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

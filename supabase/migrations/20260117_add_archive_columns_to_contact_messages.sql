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

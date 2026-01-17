-- Create wanted_items table for users to request items they want to buy
CREATE TABLE wanted_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  reference VARCHAR(255),
  description TEXT,
  max_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_wanted_items_user_id ON wanted_items(user_id);
CREATE INDEX idx_wanted_items_status ON wanted_items(status);
CREATE INDEX idx_wanted_items_brand ON wanted_items(brand);
CREATE INDEX idx_wanted_items_reference ON wanted_items(reference);

-- Create table for notifications when a matching item is listed
CREATE TABLE wanted_item_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wanted_item_id UUID NOT NULL REFERENCES wanted_items(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notified_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  UNIQUE(wanted_item_id, listing_id)
);

CREATE INDEX idx_wanted_item_notifications_user_id ON wanted_item_notifications(user_id);
CREATE INDEX idx_wanted_item_notifications_is_read ON wanted_item_notifications(is_read);

-- Enable Row Level Security
ALTER TABLE wanted_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wanted_item_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wanted_items
CREATE POLICY "Users can view their own wanted items"
  ON wanted_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wanted items"
  ON wanted_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wanted items"
  ON wanted_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wanted items"
  ON wanted_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for wanted_item_notifications
CREATE POLICY "Users can view their own notifications"
  ON wanted_item_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON wanted_item_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON wanted_item_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wanted_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wanted_items_updated_at
  BEFORE UPDATE ON wanted_items
  FOR EACH ROW
  EXECUTE FUNCTION update_wanted_items_updated_at();

-- Function to automatically notify users when a matching listing is created
CREATE OR REPLACE FUNCTION notify_wanted_item_matches()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process active listings of type 'unit'
  IF NEW.status = 'active' AND NEW.listing_type = 'unit' THEN
    -- Insert notifications for matching wanted items
    INSERT INTO wanted_item_notifications (wanted_item_id, listing_id, user_id)
    SELECT
      wi.id,
      NEW.id,
      wi.user_id
    FROM wanted_items wi
    JOIN unit_listings ul ON NEW.id = ul.listing_id
    WHERE wi.status = 'active'
      AND wi.user_id != NEW.seller_id  -- Don't notify the seller
      AND (
        -- Match by reference (most specific)
        (wi.reference IS NOT NULL AND wi.reference != '' AND ul.reference ILIKE wi.reference)
        OR
        -- Match by brand and model
        (ul.brand ILIKE wi.brand AND (wi.model IS NULL OR wi.model = '' OR ul.model ILIKE wi.model))
      )
      AND (wi.max_price IS NULL OR ul.price <= wi.max_price)
    ON CONFLICT (wanted_item_id, listing_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_notify_wanted_matches
  AFTER INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_wanted_item_matches();

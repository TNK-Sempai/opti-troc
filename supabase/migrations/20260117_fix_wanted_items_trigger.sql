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

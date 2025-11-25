-- ============================================================================
-- SongPebble Database Migration: Restructure Characters to To/From
-- ============================================================================
-- This migration restructures the characters system:
-- - Renames 'characters' table to 'to_characters' (recipients)
-- - Creates new 'senders' table (just names)
--
-- Run this in the Supabase SQL Editor
--
-- Created: 2025-11-25
-- ============================================================================

-- Rename characters table to to_characters
ALTER TABLE IF EXISTS public.characters
RENAME TO to_characters;

-- Update comments
COMMENT ON TABLE public.to_characters IS 'Stores recipient character details for personalized songs. Each order can have 0-8 recipients.';

-- Update index name
ALTER INDEX IF EXISTS idx_characters_order_id
RENAME TO idx_to_characters_order_id;

-- Update foreign key constraint name (if needed)
ALTER TABLE public.to_characters
DROP CONSTRAINT IF EXISTS fk_characters_order;

ALTER TABLE public.to_characters
ADD CONSTRAINT fk_to_characters_order
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- Create senders table
CREATE TABLE IF NOT EXISTS public.senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraint to orders table with cascade delete
  CONSTRAINT fk_senders_order
    FOREIGN KEY (order_id)
    REFERENCES public.orders(id)
    ON DELETE CASCADE
);

-- Create index on order_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_senders_order_id
ON public.senders(order_id);

-- Add comments for documentation
COMMENT ON TABLE public.senders IS 'Stores sender names for personalized songs. Each order can have 0-8 senders.';
COMMENT ON COLUMN public.senders.id IS 'Unique identifier for the sender';
COMMENT ON COLUMN public.senders.order_id IS 'Foreign key to the orders table';
COMMENT ON COLUMN public.senders.sender_name IS 'Name of the sender (required)';
COMMENT ON COLUMN public.senders.created_at IS 'Timestamp when the sender was created';

-- Enable Row Level Security (RLS) on senders table
ALTER TABLE public.senders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Allow service role to do everything
CREATE POLICY "Service role can manage senders"
ON public.senders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create RLS policy: Allow authenticated users to read their own order's senders
CREATE POLICY "Users can view senders for their orders"
ON public.senders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = senders.order_id
    AND orders.customer_email = auth.jwt() ->> 'email'
  )
);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the migration was successful:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('to_characters', 'senders');
--
-- SELECT * FROM to_characters LIMIT 5;
-- SELECT * FROM senders LIMIT 5;
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Migration complete: Restructured characters to to_characters and senders';
  RAISE NOTICE '✓ Renamed: characters → to_characters';
  RAISE NOTICE '✓ Created: senders table';
  RAISE NOTICE '✓ Both tables have CASCADE delete on order_id';
  RAISE NOTICE '✓ RLS enabled on both tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify migration with the SELECT queries above';
  RAISE NOTICE '2. Update application code to use new table names';
  RAISE NOTICE '3. Test form submission';
END $$;

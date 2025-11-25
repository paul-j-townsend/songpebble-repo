-- ============================================================================
-- SongPebble Database Migration: Add Characters Table
-- ============================================================================
-- This migration creates a new 'characters' table to store character details
-- for personalized songs. Each order can have 0-8 characters.
--
-- Run this in the Supabase SQL Editor
--
-- Created: 2025-11-25
-- ============================================================================

-- Create characters table
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  character_name TEXT NOT NULL,
  character_gender TEXT,
  character_interests TEXT,
  character_mention TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraint to orders table with cascade delete
  CONSTRAINT fk_characters_order
    FOREIGN KEY (order_id)
    REFERENCES public.orders(id)
    ON DELETE CASCADE,

  -- Ensure gender is one of the allowed values
  CONSTRAINT check_character_gender
    CHECK (character_gender IN ('male', 'female', 'other') OR character_gender IS NULL)
);

-- Create index on order_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_characters_order_id
ON public.characters(order_id);

-- Add comments for documentation
COMMENT ON TABLE public.characters IS 'Stores character details for personalized songs. Each order can have 0-8 characters.';
COMMENT ON COLUMN public.characters.id IS 'Unique identifier for the character';
COMMENT ON COLUMN public.characters.order_id IS 'Foreign key to the orders table';
COMMENT ON COLUMN public.characters.character_name IS 'Name of the character (required)';
COMMENT ON COLUMN public.characters.character_gender IS 'Gender of the character: male, female, or other (optional)';
COMMENT ON COLUMN public.characters.character_interests IS 'Interests/hobbies of the character (optional)';
COMMENT ON COLUMN public.characters.character_mention IS 'One special thing to mention about the character (optional)';
COMMENT ON COLUMN public.characters.created_at IS 'Timestamp when the character was created';

-- Enable Row Level Security (RLS) on characters table
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Allow service role to do everything
CREATE POLICY "Service role can manage characters"
ON public.characters
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create RLS policy: Allow authenticated users to read their own order's characters
CREATE POLICY "Users can view characters for their orders"
ON public.characters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = characters.order_id
    AND orders.customer_email = auth.jwt() ->> 'email'
  )
);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the migration was successful:
--
-- SELECT
--   table_name,
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'characters'
-- ORDER BY ordinal_position;
--
-- SELECT
--   conname AS constraint_name,
--   contype AS constraint_type,
--   pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'public.characters'::regclass;
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Migration complete: Characters table created';
  RAISE NOTICE '✓ Table: public.characters';
  RAISE NOTICE '✓ Columns: id, order_id, character_name, character_gender, character_interests, character_mention, created_at';
  RAISE NOTICE '✓ Foreign key: order_id → orders(id) with CASCADE delete';
  RAISE NOTICE '✓ Gender constraint: male, female, other';
  RAISE NOTICE '✓ Index created on order_id';
  RAISE NOTICE '✓ RLS enabled with policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify migration with the SELECT queries above';
  RAISE NOTICE '2. Update application schemas and forms';
  RAISE NOTICE '3. Test character creation and deletion';
END $$;

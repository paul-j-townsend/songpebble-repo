-- ============================================================================
-- SongPebble Database Migration: Add Suno AI Fields
-- ============================================================================
-- This migration adds fields to the orders table for better Suno AI integration
-- Run this in the Supabase SQL Editor
--
-- Created: 2025-11-25
-- Phase 1: High Priority Suno AI Parameters
-- ============================================================================

-- Add vocal_gender column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS vocal_gender TEXT;

-- Add tempo column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tempo TEXT;

-- Add instruments column (JSONB array for multiple selections)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS instruments JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.vocal_gender IS 'Vocal type for Suno AI: male, female, mixed, instrumental';
COMMENT ON COLUMN public.orders.tempo IS 'Song tempo for Suno AI: slow, medium, fast, very-fast';
COMMENT ON COLUMN public.orders.instruments IS 'Array of instruments for Suno AI prompt building';

-- Create index on vocal_gender for potential filtering
CREATE INDEX IF NOT EXISTS idx_orders_vocal_gender
ON public.orders(vocal_gender);

-- Create index on tempo for potential filtering
CREATE INDEX IF NOT EXISTS idx_orders_tempo
ON public.orders(tempo);

-- Add check constraints (optional, for data validation)
ALTER TABLE public.orders
ADD CONSTRAINT valid_vocal_gender CHECK (
  vocal_gender IS NULL OR
  vocal_gender IN ('male', 'female', 'mixed', 'instrumental')
);

ALTER TABLE public.orders
ADD CONSTRAINT valid_tempo CHECK (
  tempo IS NULL OR
  tempo IN ('slow', 'medium', 'fast', 'very-fast')
);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the migration was successful:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- AND column_name IN ('vocal_gender', 'tempo', 'instruments')
-- ORDER BY ordinal_position;
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Migration complete: Suno AI fields added to orders table';
  RAISE NOTICE '✓ Added columns: vocal_gender, tempo, instruments';
  RAISE NOTICE '✓ Created indexes for vocal_gender and tempo';
  RAISE NOTICE '✓ Added validation constraints';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify migration with the SELECT query above';
  RAISE NOTICE '2. Test form submission in the application';
  RAISE NOTICE '3. Check that new fields are stored correctly';
END $$;

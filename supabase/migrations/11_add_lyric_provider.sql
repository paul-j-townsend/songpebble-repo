-- Add lyric_provider column to track Claude vs template generation
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS lyric_provider TEXT;

-- Ensure only expected values are stored
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS lyric_provider_check;

ALTER TABLE public.orders
ADD CONSTRAINT lyric_provider_check
CHECK (lyric_provider IS NULL OR lyric_provider IN ('claude', 'template'));

-- Document the purpose of the column
COMMENT ON COLUMN public.orders.lyric_provider IS 'Lyrics generation source: claude (AI) or template fallback';

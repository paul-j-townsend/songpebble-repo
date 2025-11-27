-- Update occasion constraint with new values
-- First, drop the old constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS occasion_check;

-- Add new constraint with updated occasion values
ALTER TABLE public.orders
ADD CONSTRAINT occasion_check
CHECK (occasion IN ('christmas', 'birthday', 'leaving-gift', 'roast', 'pets', 'kids'));

-- Add tone column (optional)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tone TEXT;

-- Add check constraint for tone values
ALTER TABLE public.orders
ADD CONSTRAINT tone_check
CHECK (tone IS NULL OR tone IN ('funny', 'sweet', 'epic', 'rude', 'emotional'));

-- Add comment for tone column
COMMENT ON COLUMN public.orders.tone IS 'The mood/tone of the song (optional)';

-- Update existing records: map old occasions to new ones
-- 'anniversary' -> 'leaving-gift' (closest match)
-- 'other' -> 'christmas' (default fallback)
UPDATE public.orders
SET occasion = CASE
  WHEN occasion = 'anniversary' THEN 'leaving-gift'
  WHEN occasion = 'other' THEN 'christmas'
  ELSE occasion
END
WHERE occasion IN ('anniversary', 'other');

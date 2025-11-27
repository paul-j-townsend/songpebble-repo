-- Add occasion field to orders table
ALTER TABLE public.orders
ADD COLUMN occasion TEXT DEFAULT 'christmas';

-- Add check constraint for valid occasions
ALTER TABLE public.orders
ADD CONSTRAINT occasion_check
CHECK (occasion IN ('christmas', 'birthday', 'anniversary', 'other'));

-- Add comment
COMMENT ON COLUMN public.orders.occasion IS 'The occasion or event type for the song';

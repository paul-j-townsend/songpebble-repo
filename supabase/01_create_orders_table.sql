-- Create orders table for SongPebble
-- This table stores customer orders and their payment/delivery status

CREATE TABLE IF NOT EXISTS public.orders (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer information
  customer_email TEXT NOT NULL,
  customer_name TEXT,

  -- Song details from form
  song_title TEXT NOT NULL,
  song_style TEXT NOT NULL,
  song_mood TEXT,
  lyrics_input TEXT NOT NULL,

  -- Payment information
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- Amount in cents (e.g., 2000 for £20)
  currency TEXT DEFAULT 'gbp',

  -- Order status
  -- Possible values: 'pending', 'paid', 'processing', 'delivered', 'failed'
  status TEXT NOT NULL DEFAULT 'pending',

  -- File storage (populated after delivery)
  mp3_url TEXT,
  wav_url TEXT,
  lyrics_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'processing', 'delivered', 'failed')),
  CONSTRAINT valid_currency CHECK (currency IN ('gbp', 'usd', 'eur')),
  CONSTRAINT valid_amount CHECK (amount_paid IS NULL OR amount_paid > 0)
);

-- Add comment to table
COMMENT ON TABLE public.orders IS 'Stores customer song orders with payment and delivery status';

-- Add comments to important columns
COMMENT ON COLUMN public.orders.status IS 'Order lifecycle: pending → paid → processing → delivered';
COMMENT ON COLUMN public.orders.stripe_session_id IS 'Stripe Checkout session ID for payment tracking';
COMMENT ON COLUMN public.orders.amount_paid IS 'Payment amount in smallest currency unit (cents/pence)';

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy: No public access (server-side only via service role key)
CREATE POLICY "No public access to orders"
  ON public.orders
  FOR ALL
  TO public
  USING (false);

-- Note: Access will be done server-side using SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS policies

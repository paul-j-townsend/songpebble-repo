-- ============================================================================
-- SongPebble Database Setup - Complete Script
-- ============================================================================
-- This script creates all tables, indexes, and triggers needed for SongPebble
-- Run this in the Supabase SQL Editor to set up your database
--
-- Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
-- Navigate to: SQL Editor → New Query → Paste this script → Run
-- ============================================================================

-- ============================================================================
-- 1. CREATE ORDERS TABLE
-- ============================================================================

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

-- Add comments
COMMENT ON TABLE public.orders IS 'Stores customer song orders with payment and delivery status';
COMMENT ON COLUMN public.orders.status IS 'Order lifecycle: pending → paid → processing → delivered';
COMMENT ON COLUMN public.orders.stripe_session_id IS 'Stripe Checkout session ID for payment tracking';
COMMENT ON COLUMN public.orders.amount_paid IS 'Payment amount in smallest currency unit (cents/pence)';

-- ============================================================================
-- 2. CREATE DELIVERIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.deliveries (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to orders
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  -- Email information
  recipient_email TEXT NOT NULL,
  email_provider TEXT, -- 'postmark' or 'resend'
  email_provider_id TEXT, -- External ID from email service for tracking

  -- Delivery status
  -- Possible values: 'sent', 'delivered', 'bounced', 'failed'
  status TEXT NOT NULL DEFAULT 'sent',

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_delivery_status CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
  CONSTRAINT valid_email_provider CHECK (email_provider IN ('postmark', 'resend', NULL)),
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0)
);

-- Add comments
COMMENT ON TABLE public.deliveries IS 'Tracks email deliveries sent to customers for their orders';
COMMENT ON COLUMN public.deliveries.status IS 'Email delivery status: sent → delivered (or bounced/failed)';
COMMENT ON COLUMN public.deliveries.email_provider_id IS 'External message ID from email service for webhook tracking';

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id
  ON public.orders(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON public.orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id
  ON public.orders(stripe_payment_intent_id);

-- Deliveries table indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id
  ON public.deliveries(order_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_status
  ON public.deliveries(status);

CREATE INDEX IF NOT EXISTS idx_deliveries_created_at
  ON public.deliveries(created_at DESC);

-- Add index comments
COMMENT ON INDEX idx_orders_status IS 'Optimizes queries filtering by order status';
COMMENT ON INDEX idx_orders_stripe_session_id IS 'Optimizes webhook lookups by Stripe session ID';
COMMENT ON INDEX idx_orders_customer_email IS 'Optimizes download page validation by email';

-- ============================================================================
-- 4. CREATE TRIGGERS
-- ============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to deliveries table
DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies: No public access (server-side only via service role key)
CREATE POLICY "No public access to orders"
  ON public.orders
  FOR ALL
  TO public
  USING (false);

CREATE POLICY "No public access to deliveries"
  ON public.deliveries
  FOR ALL
  TO public
  USING (false);

-- Note: All database operations will use SUPABASE_SERVICE_ROLE_KEY server-side
-- The service role bypasses RLS policies for full access

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✓ Database setup complete!';
  RAISE NOTICE '✓ Tables created: orders, deliveries';
  RAISE NOTICE '✓ Indexes created: 9 total';
  RAISE NOTICE '✓ Triggers created: updated_at auto-update';
  RAISE NOTICE '✓ RLS enabled: server-side access only';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set up storage buckets (see 04_storage_setup.md)';
  RAISE NOTICE '2. Configure Stripe (see planning/todo.md Phase 3)';
  RAISE NOTICE '3. Test database connection with: npm run test-supabase';
END $$;

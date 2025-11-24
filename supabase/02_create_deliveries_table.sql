-- Create deliveries table for SongPebble
-- This table tracks email deliveries sent to customers

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

-- Create index for faster lookups by order
CREATE INDEX idx_deliveries_order_id ON public.deliveries(order_id);

-- Create index for status queries
CREATE INDEX idx_deliveries_status ON public.deliveries(status);

-- Create index for timestamp queries
CREATE INDEX idx_deliveries_created_at ON public.deliveries(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Create policy: No public access (server-side only via service role key)
CREATE POLICY "No public access to deliveries"
  ON public.deliveries
  FOR ALL
  TO public
  USING (false);

-- Note: Access will be done server-side using SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS policies

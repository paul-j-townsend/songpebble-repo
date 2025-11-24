-- Create indexes for the orders table
-- These indexes optimize common query patterns

-- Index for order status queries (e.g., finding all 'paid' orders)
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

-- Index for Stripe session ID lookups (used in webhook)
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id
  ON public.orders(stripe_session_id);

-- Index for customer email lookups (for download page validation)
CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON public.orders(customer_email);

-- Index for created_at timestamp (for chronological queries)
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders(created_at DESC);

-- Composite index for status + created_at (for admin dashboard queries)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders(status, created_at DESC);

-- Index for payment intent ID (for Stripe webhook idempotency)
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id
  ON public.orders(stripe_payment_intent_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at on deliveries
DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON INDEX idx_orders_status IS 'Optimizes queries filtering by order status';
COMMENT ON INDEX idx_orders_stripe_session_id IS 'Optimizes webhook lookups by Stripe session ID';
COMMENT ON INDEX idx_orders_customer_email IS 'Optimizes download page validation by email';

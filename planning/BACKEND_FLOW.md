# Backend Flow Specification

## API Route: POST /api/create-order

1. Validate payload  
2. Insert order → status: pending  
3. Create Stripe Checkout Session  
4. Store stripe_session_id  
5. Return checkoutUrl  

## API Route: POST /api/stripe-webhook

- Verify signature  
- If checkout.session.completed:
  - Find order
  - Set status = paid
  - Queue song generation

## Track Generation

### Phase 1 – Manual  
You generate track manually in Suno, upload to Supabase.

### Phase 2 – Semi Automated  
Script polls paid orders → generates → delivers.

### Phase 3 – Fully Automated  
Automated job queue processing.


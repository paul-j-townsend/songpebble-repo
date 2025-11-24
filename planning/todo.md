# SongPebble MVP Development Todo

## Phase 1: Project Setup & Core Infrastructure

- [x] Initialize Next.js 14 project with TypeScript, ESLint, Tailwind, App Router
- [x] Install dependencies (react-hook-form, zod, @hookform/resolvers, @supabase/supabase-js, stripe)
- [x] Create folder structure (src/components, src/lib, src/app/api)
- [x] Create .env.local template file
- [x] Create .env.example for documentation
- [x] Add environment variable validation (src/lib/validateEnv.ts)

## Phase 2: Supabase Setup

- [x] Run SQL to create `orders` table with proper schema (see supabase/00_setup_all.sql)
- [x] Run SQL to create `deliveries` table (see supabase/00_setup_all.sql)
- [x] Create indexes on orders (status, stripe_session_id) (see supabase/00_setup_all.sql)
- [ ] Create storage buckets: `tracks` and `lyrics` (public = false) - See supabase/04_storage_setup.md
- [ ] Configure storage policies for signed-URL-only access (fix the `or true` issue) - See supabase/04_storage_setup.md
- [x] Test Supabase connection from local environment

## Phase 3: Stripe Setup

- [ ] Create Stripe product "Custom AI Song" at �20
- [ ] Copy Price ID to .env.local (STRIPE_PRICE_ID)
- [ ] Get Stripe Secret Key (STRIPE_SECRET_KEY)
- [ ] Install Stripe CLI for local testing
- [ ] Configure webhook endpoint for local development

## Phase 4: Core Application - Form & Schema

- [x] Create Zod schema (src/lib/songSchema.ts)
- [x] Create SongForm component (src/components/SongForm.tsx)
- [x] Create homepage (src/app/page.tsx) with SongForm
- [ ] Test form validation (all fields, error states) - Ready to test
- [ ] Test form submission (integrated with API)

## Phase 5: API Routes - Order Creation

- [x] Create Supabase admin client (src/lib/supabaseAdmin.ts)
- [x] Create Stripe client (src/lib/stripe.ts)
- [x] Implement /api/create-order route
  - [x] Validate payload with Zod
  - [x] Create order in Supabase (status: pending)
  - [x] Create Stripe Checkout session with customer_email
  - [x] Update order with stripe_session_id
  - [x] Return checkoutUrl to frontend
- [ ] Test create-order end-to-end (form → API → Supabase → Stripe redirect) - Needs Stripe setup

## Phase 6: Stripe Webhook

- [x] Implement /api/stripe-webhook route
  - [x] Handle raw body parsing for signature verification
  - [x] Verify webhook signature
  - [x] Handle checkout.session.completed event
  - [x] Add idempotency check (don't update if already paid)
  - [x] Update order status to 'paid'
  - [x] Log errors properly
- [ ] Test webhook locally with Stripe CLI - Needs Stripe setup
  - [ ] stripe listen --forward-to localhost:3000/api/stripe-webhook
  - [ ] stripe trigger checkout.session.completed
  - [ ] Verify order status changes to 'paid' in Supabase

## Phase 7: Thank You Page

- [x] Create /thank-you page (src/app/thank-you/page.tsx)
- [x] Validate order exists using query param
- [x] Display confirmation message and order ID
- [x] Add error state if order not found
- [ ] Test full flow: form → payment → thank you redirect - Needs Stripe setup

## Phase 8: Email Service Implementation **[CRITICAL - MISSING FROM ORIGINAL DOCS]**

- [ ] Choose email provider (Postmark or Resend)
- [ ] Get API key and add to .env.local
- [ ] Create email service (src/lib/emailService.ts)
  - [ ] sendDeliveryEmail function
  - [ ] Error handling and retry logic
- [ ] Create email template (src/lib/emailTemplates.ts)
  - [ ] Include order ID
  - [ ] Include download link with order ID and email params
  - [ ] Simple, clean formatting
- [ ] Test email sending with test credentials

## Phase 9: Download Page **[CRITICAL - MISSING FROM ORIGINAL DOCS]**

- [ ] Create /download page (src/app/download/page.tsx)
  - [ ] Extract order and email from query params
  - [ ] Validate order exists in Supabase
  - [ ] Validate email matches order
  - [ ] Validate order status is 'delivered'
  - [ ] Generate signed URLs for MP3, WAV, lyrics (1 hour validity)
  - [ ] Display download links
  - [ ] Handle error states (invalid order, wrong email, not delivered yet)
  - [ ] Add rate limiting consideration
- [ ] Test download page with valid order
- [ ] Test error cases (wrong email, missing order, etc.)

## Phase 10: Delivery Pipeline (Manual MVP)

- [ ] Document manual process for Phase 1
  1. Check Supabase for paid orders
  2. Generate song in Suno manually
  3. Download MP3, WAV, lyrics
  4. Upload files to Supabase Storage (tracks/[orderId]/*)
  5. Update order with file URLs
  6. Update order status to 'delivered'
  7. Send delivery email manually
- [ ] Create upload helper script (optional)
- [ ] Test complete manual delivery flow

## Phase 11: Production Preparation

- [ ] Fix Supabase storage policy (remove `or true`, use proper signed URL policy)
- [ ] Add rate limiting to API routes (Vercel rate limiting or middleware)
- [ ] Add error monitoring (Sentry or similar) **[RECOMMENDED]**
- [ ] Create .gitignore (exclude .env.local, node_modules, .next)
- [ ] Test full user journey locally
  1. Fill form
  2. Complete Stripe test payment
  3. Verify webhook updates order to 'paid'
  4. Manually deliver files
  5. Verify download page works
- [ ] Review all error handling and logging
- [ ] Security audit
  - [ ] No secrets in client code
  - [ ] Signed URLs only for storage
  - [ ] Webhook signature verification
  - [ ] Input validation on all API routes

## Phase 12: Deployment

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect Vercel to repository
- [ ] Add all environment variables in Vercel dashboard
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_PRICE_ID
  - [ ] STRIPE_WEBHOOK_SECRET (production webhook secret)
  - [ ] BASE_URL (production URL)
  - [ ] Email provider API key
- [ ] Deploy to Vercel
- [ ] Configure production Stripe webhook endpoint
- [ ] Test production webhook with Stripe dashboard
- [ ] Test full production flow with test payment

## Future Enhancements (Post-MVP)

- [ ] Phase 2: Semi-automated Suno generation script
- [ ] Phase 3: Fully automated job queue
- [ ] User order tracking page
- [ ] Resend email functionality
- [ ] Idempotency keys for Stripe API calls
- [ ] Unit and integration tests
- [ ] Monitoring dashboard for stuck orders
- [ ] Terms, Privacy, and Refund policy pages
- [ ] CI/CD with GitHub Actions (typecheck, build)

---

## Notes

- **Priority**: Complete Phases 1-9 before any deployment
- **Critical gaps identified**: Email service and Download page need implementation (not in original docs)
- **Security fix needed**: Supabase storage policy has `or true` which is too permissive
- **Testing**: Use Stripe CLI for webhook testing before production deployment
- **Stripe customer_email**: Must be added to checkout session creation

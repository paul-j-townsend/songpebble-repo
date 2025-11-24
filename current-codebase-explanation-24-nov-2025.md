# Current Codebase Explanation – 24 Nov 2025

## Overview
SongPebble is a Next.js 14 (App Router) application that sells bespoke AI-generated songs. The top-level `src/app/page.tsx` renders a minimal marketing hero plus `<SongForm />`, which is the primary user touchpoint. Payments are collected entirely through Stripe Checkout, and order persistence lives in Supabase (Postgres + Storage). The project follows a documentation-first philosophy: the `planning/` folder contains detailed guides for architecture, APIs, and TODOs, while `supabase/` houses SQL migrations.

## Frontend & UX
- **SongForm (`src/components/SongForm.tsx`):** Client component using React Hook Form + Zod. It gathers customer email, name, song metadata, and a lyrics brief, validates locally, and POSTs JSON to `/api/create-order`. Submission state is surfaced through button text and an inline error alert.
- **Pages:** `src/app/page.tsx` embeds the form; `src/app/thank-you/page.tsx` reads `order_id` from search params and outlines next steps. A `/download` route exists but is currently empty pending delivery work. Global styling relies on Tailwind via `globals.css`.

## Backend & APIs
- **Order Creation (`src/app/api/create-order/route.ts`):** Re-validates with `songFormSchema`, inserts a pending order using the Supabase service-role client, creates a Stripe Checkout session (price ID & base URL pulled from env helpers), stores the `stripe_session_id`, and returns the hosted checkout URL.
- **Stripe Webhook (`src/app/api/stripe-webhook/route.ts`):** Reads the raw request body, verifies the signature with `STRIPE_WEBHOOK_SECRET`, and handles `checkout.session.completed` by marking the order as `paid`, persisting payment intent metadata, and short-circuiting if the status was already updated.
- **Libraries:** `src/lib/stripe.ts` encapsulates the Stripe SDK + env lookups, `supabaseAdmin.ts` builds the service-role client with typed tables, `validateEnv.ts` enforces required configuration, and `songSchema.ts` exports both form validation and an `orderSchema` aligned with the DB.

## Data & Tooling
- **Supabase:** SQL migrations under `supabase/` create `orders` and `deliveries`, indexes, and storage instructions for private buckets (`tracks`, `lyrics`). `test-supabase.mjs` lets developers confirm env vars and connectivity via `npm run test:supabase`.
- **Scripts:** Core npm scripts are the standard Next trio (`dev`, `build`, `start`) plus `lint` and `test:supabase`. There is no Jest/Playwright suite yet; lint + Supabase verification serve as preflight checks.

## Current Gaps
- Storage buckets/policies need finishing, Stripe product + CLI/webhook tests are pending, the `/download` page and automated delivery/email pipeline are placeholders, and several checklist items remain open in `planning/todo.md`.

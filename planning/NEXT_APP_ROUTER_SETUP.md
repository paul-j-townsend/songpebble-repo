
# Next.js App Router Setup - SongPebble

Target: Next.js 14 with App Router, TypeScript, Tailwind, API routes, Stripe, and Supabase.

## 1. Create the project

```bash
npx create-next-app@latest songpebble   --typescript   --eslint   --tailwind   --app   --src-dir   --import-alias "@/*"
```

## 2. Install extra dependencies

```bash
cd songpebble
npm install react-hook-form zod @hookform/resolvers
npm install @supabase/supabase-js
npm install stripe
```

## 3. High level structure

- `src/app/page.tsx` - main song form page
- `src/app/thank-you/page.tsx` - post payment page
- `src/app/download/page.tsx` - download page
- `src/app/api/create-order/route.ts` - creates order and Stripe session
- `src/app/api/stripe-webhook/route.ts` - handles Stripe webhooks
- `src/lib/songSchema.ts` - Zod schema
- `src/lib/supabaseClient.ts` - Supabase client
- `src/lib/stripe.ts` - Stripe instance
- `src/components/SongForm.tsx` - main form
- `src/components/ui/*` - small UI components

## 4. Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID=...
BASE_URL=http://localhost:3000
```

- Only `NEXT_PUBLIC_*` are exposed to the browser.
- Use the service role key only inside API routes or server components.

## 5. Routing overview

- `/` - renders `src/app/page.tsx` with `<SongForm />`
- `/thank-you` - used as `success_url` for Stripe
- `/download` - used for signed download links

API routes use the App Router `route.ts` convention:

- `src/app/api/create-order/route.ts` - `POST`
- `src/app/api/stripe-webhook/route.ts` - `POST` with raw body handling

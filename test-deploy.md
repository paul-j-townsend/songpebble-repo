# SongPebble - Complete Test & Deploy Guide

This guide walks you through setting up and deploying SongPebble from scratch, including all services and integrations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Supabase Setup](#supabase-setup)
4. [Stripe Setup](#stripe-setup)
5. [API.box Setup](#apibox-setup)
6. [Environment Configuration](#environment-configuration)
7. [Local Development Setup](#local-development-setup)
8. [Testing the Application](#testing-the-application)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- **Supabase Account**: Sign up at https://supabase.com
- **Stripe Account**: Sign up at https://stripe.com
- **API.box Account**: Sign up at https://api.box
- **GitHub Account** (for deployment): Sign up at https://github.com

### Required Software

- **Node.js** 18+ and npm
- **Git**
- **A code editor** (VS Code recommended)
- **Terminal/Command Line access**

### Optional (for local webhook testing)

- **ngrok** (for local webhook testing)
- **Stripe CLI** (for local Stripe webhook testing)

---

## Project Setup

### 1. Clone or Initialize Project

```bash
# If cloning from repository
git clone <repository-url>
cd songpebble-repo

# Or if starting fresh
npx create-next-app@latest songpebble --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
cd songpebble
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14 with App Router
- React Hook Form + Zod for form validation
- Supabase client
- Stripe SDK
- Tailwind CSS
- Testing libraries

### 3. Verify Installation

```bash
npm run lint
npm run build
```

Both commands should complete without errors.

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: SongPebble (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGci...`)
   - **service_role key** (starts with `eyJhbGci...`) - **Keep this secret!**

### Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/00_setup_all.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Wait for success message

This creates:
- `orders` table
- `deliveries` table
- `to_characters` table (recipients)
- `senders` table
- All indexes and triggers
- Row Level Security policies

### Step 4: Set Up Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Create two buckets:

   **Bucket 1: `tracks`**
   - Click **"New bucket"**
   - Name: `tracks`
   - **Public bucket**: **UNCHECK** (must be private)
   - Click **"Create bucket"**

   **Bucket 2: `lyrics`**
   - Click **"New bucket"**
   - Name: `lyrics`
   - **Public bucket**: **UNCHECK** (must be private)
   - Click **"Create bucket"**

### Step 5: Verify Supabase Connection

```bash
npm run test:supabase
```

This should output:
```
✅ All tests passed! Your Supabase credentials are working correctly.
```

---

## Stripe Setup

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete account verification

### Step 2: Create Product

1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Click **"Add Product"** (top right)
3. Fill in:
   - **Name**: Custom AI Song
   - **Description**: AI-generated custom song with MP3, WAV, and lyrics
   - **Pricing**:
     - **Model**: Standard pricing
     - **Price**: 20.00
     - **Currency**: GBP
     - **Billing period**: One time
4. Click **"Save product"**
5. **Copy the Price ID** (looks like `price_1ABC123...`)

### Step 3: Get API Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Find your **"Secret key"** (starts with `sk_test_`)
3. Click **"Reveal test key"** and copy it
4. **Important**: Keep this key secret! Never commit it to git.

### Step 4: Set Up Stripe CLI (for Local Webhook Testing)

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

### Step 5: Configure Stripe CLI

```bash
stripe login
```

This opens your browser to authenticate.

### Step 6: Get Webhook Secret (for Local Development)

In a separate terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Copy the `whsec_xxxxx` value** - you'll need it for `.env.local`.

**Keep this terminal running** while developing - it forwards Stripe webhooks to your local server.

---

## API.box Setup

### Step 1: Create API.box Account

1. Go to https://api.box
2. Sign up for an account
3. Verify your email

### Step 2: Get API Key

1. Log in to API.box dashboard
2. Navigate to **API Key** section
3. Copy your API key
4. **Important**: Keep this key secret!

### Step 3: Add Credits

1. Go to **Billing** section
2. Add credits to your account (required for generating songs)
3. Note: Each song generation consumes credits (typically 12 credits per song)

---

## Environment Configuration

### Create `.env.local` File

Create a file named `.env.local` in the project root:

```bash
# Supabase - Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key

# Supabase - Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key

# Stripe - Private (server-side only)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# API.box - Private (server-side only)
API_BOX_KEY=your-api-box-key-here

# Application URLs
BASE_URL=http://localhost:3000
NGROK_URL=https://your-ngrok-url.ngrok-free.app  # Optional, for local webhook testing
```

### Replace All Placeholders

- `xxxxx.supabase.co` → Your Supabase project URL
- `eyJhbGci...your-anon-key` → Your Supabase anon key
- `eyJhbGci...your-service-role-key` → Your Supabase service role key
- `sk_test_xxxxx` → Your Stripe secret key
- `price_xxxxx` → Your Stripe price ID
- `whsec_xxxxx` → Your Stripe webhook secret (from `stripe listen`)
- `your-api-box-key-here` → Your API.box API key
- `https://your-ngrok-url.ngrok-free.app` → Your ngrok URL (see next section)

### Verify Environment Variables

```bash
# Check that .env.local exists and has content
cat .env.local | grep -v "^#" | grep "="
```

You should see all the variables listed above.

---

## Local Development Setup

### Step 1: Set Up ngrok (for API.box Webhooks)

API.box needs to call your webhook, but `localhost` isn't accessible from the internet. Use ngrok to create a tunnel.

#### Install ngrok

**macOS:**
```bash
brew install ngrok
```

**Windows/Linux:**
Download from: https://ngrok.com/download

#### Authenticate ngrok

1. Sign up at https://dashboard.ngrok.com/signup (free)
2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure ngrok:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

#### Start ngrok

```bash
# Option 1: Use the provided script
./start-ngrok.sh

# Option 2: Start manually
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and add it to `.env.local`:

```bash
NGROK_URL=https://abc123.ngrok-free.app
```

**Keep ngrok running** in a separate terminal while developing.

### Step 2: Start Development Server

```bash
npm run dev
```

The server should start on http://localhost:3000

### Step 3: Verify Everything is Running

1. **Next.js**: Open http://localhost:3000 - you should see the SongPebble form
2. **ngrok**: Open http://127.0.0.1:4040 - you should see the ngrok web interface
3. **Stripe CLI**: Check the terminal where `stripe listen` is running - it should show "Ready!"

---

## Testing the Application

### Test 1: Supabase Connection

```bash
npm run test:supabase
```

Expected output:
```
✅ All tests passed! Your Supabase credentials are working correctly.
```

### Test 2: API.box Connection

1. Open http://localhost:3000
2. Click the **"Test API.box"** button
3. Check browser console and server logs
4. You should see:
   - ✅ Success message
   - Task ID returned
   - Order created in database

### Test 3: Full Order Flow

1. **Fill out the form** on http://localhost:3000
2. **Click "Create My Song"**
3. **You'll be redirected to Stripe Checkout**
4. **Use test card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. **Complete payment**
6. **You'll be redirected to `/thank-you` page**

### Test 4: Verify Webhook Processing

After payment:

1. **Check Stripe CLI terminal** - you should see webhook events
2. **Check server console** - you should see:
   ```
   Processing checkout.session.completed: cs_test_...
   Order marked as paid: [order-id]
   Song generation started for order [order-id]
   ```
3. **Check Supabase**:
   - Go to **Table Editor** → `orders`
   - Find your order - status should be `processing`
4. **Wait 20-60 seconds** for song generation
5. **Check server console** - you should see webhook logs:
   ```
   🎵 [WEBHOOK] Received API.box webhook callback
   📥 [STORAGE] Downloading audio file...
   ✅ [STORAGE] Audio file uploaded successfully
   ✅ [WEBHOOK] Order delivered successfully!
   ```
6. **Check Supabase Storage**:
   - Go to **Storage** → `tracks` bucket
   - You should see a folder with your order ID
   - Inside should be `song.mp3` or `song.wav`
7. **Check database**:
   - Order status should be `delivered`
   - `mp3_url`, `wav_url` should be populated

### Test 5: Manual Webhook Trigger (if needed)

If webhooks aren't working automatically, you can trigger manually:

1. Get the download URL from API.box logs: https://api.box/logs
2. Get your order ID from the database
3. Trigger webhook:

```bash
curl -X POST http://localhost:3000/api/test-webhook-manual \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "your-task-id",
    "status": "completed",
    "downloadUrl": "https://api.box/download/...",
    "orderId": "your-order-id"
  }'
```

---

## Deployment

### Prerequisites for Deployment

- All services configured (Supabase, Stripe, API.box)
- Application tested locally
- GitHub repository set up

### Step 1: Prepare for Production

#### Update Environment Variables

For production, you'll need:

1. **Stripe Live Keys** (not test keys):
   - Go to https://dashboard.stripe.com/apikeys
   - Switch to **Live mode**
   - Copy live secret key and price ID

2. **Production BASE_URL**:
   - Your deployed domain (e.g., `https://songpebble.com`)

3. **Production Webhook Secrets**:
   - Stripe: Set up webhook endpoint in Stripe dashboard
   - API.box: Use your production domain (no ngrok needed)

#### Update Stripe Webhook Endpoint

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret

### Step 2: Deploy to Vercel (Recommended)

#### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add all environment variables from `.env.local`
7. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to link project and add environment variables
```

### Step 3: Configure Production Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=... (LIVE KEY)
STRIPE_PRICE_ID=... (LIVE PRICE ID)
STRIPE_WEBHOOK_SECRET=... (PRODUCTION WEBHOOK SECRET)
API_BOX_KEY=...
BASE_URL=https://yourdomain.com
```

### Step 4: Set Up Production Webhooks

#### Stripe Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret to Vercel environment variables

#### API.box Webhook

The callback URL in your code will automatically use `BASE_URL`, so no additional setup needed. Just ensure `BASE_URL` is set to your production domain.

### Step 5: Test Production Deployment

1. Visit your deployed URL
2. Test the form submission
3. Complete a test payment (use Stripe test mode first)
4. Verify webhooks are working
5. Check Supabase for order creation
6. Verify song generation and storage

### Step 6: Switch to Live Mode

Once everything works in test mode:

1. Update Stripe keys to live keys in Vercel
2. Update `STRIPE_PRICE_ID` to live price ID
3. Redeploy application
4. Test with a real payment (small amount)

---

## Troubleshooting

### Common Issues

#### "Missing environment variable" errors

**Solution:**
- Check `.env.local` exists and has all required variables
- Restart dev server after changing `.env.local`
- For production, verify all variables are set in Vercel

#### Supabase connection fails

**Solution:**
- Verify credentials in Supabase dashboard
- Check project is active (not paused)
- Run `npm run test:supabase` to diagnose

#### Stripe webhook not working locally

**Solution:**
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
- Verify `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen`
- Check webhook secret is in `.env.local`
- Restart dev server

#### API.box webhook not working locally

**Solution:**
- Ensure ngrok is running: `ngrok http 3000`
- Verify `NGROK_URL` in `.env.local` matches ngrok URL
- Check ngrok web interface: http://127.0.0.1:4040
- Restart dev server after updating `NGROK_URL`

#### Files not appearing in Supabase Storage

**Solution:**
- Verify storage buckets exist: `tracks` and `lyrics`
- Check buckets are private (not public)
- Verify service role key has correct permissions
- Check server logs for upload errors

#### Song generation fails

**Solution:**
- Check API.box account has credits
- Verify `API_BOX_KEY` is correct
- Check API.box logs: https://api.box/logs
- Verify webhook callback URL is accessible

#### Build errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Getting Help

1. **Check server logs** - Most issues show up in console
2. **Check browser console** - Client-side errors appear here
3. **Check ngrok web interface** - http://127.0.0.1:4040 (shows all requests)
4. **Check Supabase logs** - Dashboard → Logs
5. **Check Stripe logs** - Dashboard → Developers → Logs
6. **Check API.box logs** - https://api.box/logs

### Debug Commands

```bash
# Test Supabase connection
npm run test:supabase

# Check environment variables (without exposing secrets)
node -e "console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('STRIPE') || k.includes('API_BOX')).sort())"

# Check if servers are running
ps aux | grep -E "(next dev|ngrok|stripe listen)"

# View ngrok requests
curl http://127.0.0.1:4040/api/requests/http
```

---

## Quick Reference

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET

# API.box
API_BOX_KEY

# Application
BASE_URL
NGROK_URL  # Optional, for local development only
```

### Development Commands

```bash
# Start dev server
npm run dev

# Start ngrok (separate terminal)
ngrok http 3000

# Start Stripe webhook forwarding (separate terminal)
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Test Supabase
npm run test:supabase

# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint
```

### Important URLs

- **Local App**: http://localhost:3000
- **ngrok Web Interface**: http://127.0.0.1:4040
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **API.box Dashboard**: https://api.box
- **API.box Logs**: https://api.box/logs

---

## Next Steps

After setup is complete:

1. ✅ Test the full flow end-to-end
2. ✅ Verify files are stored in Supabase Storage
3. ✅ Test with real payments (small amounts)
4. ✅ Set up monitoring and error tracking
5. ✅ Configure email notifications (optional)
6. ✅ Set up download page for customers
7. ✅ Deploy to production
8. ✅ Monitor usage and costs

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **API.box Docs**: https://docs.api.box
- **Next.js Docs**: https://nextjs.org/docs
- **ngrok Docs**: https://ngrok.com/docs

---

**Last Updated**: 2025-11-25
**Version**: 1.0


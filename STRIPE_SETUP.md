# Stripe Setup Guide

This guide will walk you through setting up Stripe for SongPebble in test mode.

## Prerequisites

- Stripe account (sign up at <https://stripe.com> if needed)
- Access to Stripe Dashboard
- Terminal access for Stripe CLI

## Step 1: Create Product (5 minutes)

1. Go to Stripe Dashboard: <https://dashboard.stripe.com/test/products>
2. Click **"Add Product"** button (top right)
3. Fill in the details:
   - **Name:** Custom AI Song
   - **Description:** AI-generated custom song with MP3, WAV, and lyrics
   - **Pricing:**
     - **Model:** Standard pricing
     - **Price:** 20.00
     - **Currency:** GBP
     - **Billing period:** One time
4. Click **"Save product"**
5. **Copy the Price ID** - it looks like `price_1ABC123...`
   - You'll find it on the product page under the price
   - Save this for your `.env.local` file

## Step 2: Get API Keys (2 minutes)

1. Go to: <https://dashboard.stripe.com/test/apikeys>
2. Find your **"Secret key"**
   - In test mode, it starts with `sk_test_`
   - Click **"Reveal test key"** if it's hidden
   - Click the copy icon to copy it
3. **Important:** Keep this key secret! Never commit it to git.

## Step 3: Update Environment Variables (1 minute)

Edit your `.env.local` file and add:

```bash
# Stripe - Private (server-side only)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE  # Will get this in Step 4

# Application
BASE_URL=http://localhost:3000
```

Replace:
- `sk_test_YOUR_KEY_HERE` with your Secret key from Step 2
- `price_YOUR_PRICE_ID_HERE` with your Price ID from Step 1
- Keep `whsec_YOUR_SECRET_HERE` for now - we'll update in Step 4

## Step 4: Install Stripe CLI (5 minutes)

The Stripe CLI lets you test webhooks locally.

### macOS (Homebrew)

```bash
brew install stripe/stripe-cli/stripe
```

### Windows (Scoop)

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Linux (or manual install)

Download from: <https://github.com/stripe/stripe-cli/releases/latest>

### Verify Installation

```bash
stripe --version
```

## Step 5: Login to Stripe CLI (2 minutes)

```bash
stripe login
```

This will:
1. Open your browser
2. Ask you to login to Stripe
3. Ask you to confirm access
4. Return to your terminal

## Step 6: Start Webhook Forwarding (1 minute)

In your terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

You should see output like:

```
> Ready! You are using Stripe API Version [2024-12-18]. Your webhook signing secret is whsec_...
```

**Copy the webhook signing secret** (starts with `whsec_`) and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_THE_SECRET_FROM_CLI
```

**Important:** Keep this terminal running! It needs to stay open to forward webhooks.

## Step 7: Start Development Server (1 minute)

In a **new terminal window**, start your Next.js app:

```bash
npm run dev
```

Visit: <http://localhost:3000>

## Step 8: Test Complete Flow (5 minutes)

### Test the Form

1. Fill out the song form with any details
2. Click "Create My Song - £20"
3. You should be redirected to Stripe Checkout

### Test Payment

Use Stripe's test card numbers:

**Successful payment:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other test cards:**
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Full list: <https://stripe.com/docs/testing>

### Verify Success

1. Complete the payment
2. You should be redirected to `/thank-you` with your order ID
3. Check the terminal running `stripe listen` - you should see the webhook event
4. Check your development server terminal - you should see logs like:
   ```
   Processing checkout.session.completed: cs_test_...
   Order marked as paid: [order-id]
   ```
5. Check Supabase - the order status should be `paid`

## Step 9: Test Webhook Manually (Optional)

To test the webhook without going through the full payment flow:

```bash
stripe trigger checkout.session.completed
```

**Note:** This creates a test event, but won't have a real order ID, so it may fail to update your database. It's useful for testing webhook signature verification.

## Troubleshooting

### "Missing STRIPE_SECRET_KEY" error

- Check `.env.local` has `STRIPE_SECRET_KEY=sk_test_...`
- Restart your dev server: `Ctrl+C` then `npm run dev`

### Form submits but doesn't redirect

- Check browser console for errors
- Check dev server terminal for API errors
- Verify `STRIPE_PRICE_ID` is correct (should start with `price_`)

### Webhook not working

1. Is `stripe listen` running? (Check the terminal)
2. Is `STRIPE_WEBHOOK_SECRET` in `.env.local`? (Should start with `whsec_`)
3. Did you restart dev server after adding webhook secret?
4. Check the `stripe listen` terminal for incoming events

### Order not updating to 'paid'

1. Check webhook logs in `stripe listen` terminal
2. Check dev server logs for errors
3. Verify order exists in Supabase `orders` table
4. Check `stripe_session_id` in order matches the Stripe session

### "Invalid API version" warnings

The app uses Stripe API version `2024-12-18.acacia`. If Stripe releases a new version, you may see deprecation warnings. These are usually safe to ignore in test mode.

## Production Setup (Later)

When you're ready to go live:

1. Switch to **Live mode** in Stripe dashboard (toggle in top left)
2. Create the product again in live mode
3. Get live API keys (start with `sk_live_` and `price_...`)
4. Update `.env.local` (or Vercel env vars) with live keys
5. Configure webhook endpoint in Stripe dashboard:
   - URL: `https://your-domain.com/api/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the webhook secret to your production environment

## Security Checklist

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Never expose secret key client-side
- ✅ Only use secret key in API routes
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Keep Stripe libraries up to date

## Stripe Dashboard Tips

### View Test Payments

<https://dashboard.stripe.com/test/payments>

### View Customer Emails

<https://dashboard.stripe.com/test/customers>

### View Webhooks

<https://dashboard.stripe.com/test/webhooks>

### View Logs

<https://dashboard.stripe.com/test/logs>

## Next Steps

After completing Stripe setup:

1. ✅ Test the complete flow (form → payment → confirmation)
2. ✅ Verify order status updates in Supabase
3. ✅ Test different card scenarios (success, decline, etc.)
4. ⏭️ Move to Phase 8: Email Service
5. ⏭️ Move to Phase 9: Download Page

## Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

**Questions?** Check `PROGRESS.md` for common issues or review the Stripe documentation.

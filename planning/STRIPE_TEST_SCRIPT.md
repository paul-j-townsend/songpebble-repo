
# Stripe CLI Test Script - SongPebble

Use this to verify webhooks + payment flow locally.

## 1. Install Stripe CLI

https://stripe.com/docs/stripe-cli

## 2. Log in

```bash
stripe login
```

## 3. Start webhook forwarding

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

This will output:

```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy `whsec_xxxxx` into `.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 4. Test checkout completed event

```bash
stripe trigger checkout.session.completed
```

This simulates a successful payment.

Expected results:

- Local webhook prints "ok"
- Supabase `orders.status` becomes "paid"
- No errors in terminal

If you see:

```
Webhook signature verification failed
```

It means:

- Your raw body parsing is wrong
- OR the env secret is incorrect

## 5. Test failed payment scenario

```bash
stripe trigger charge.failed
```

Webhook should ignore this safely.

## 6. Check payload

```bash
stripe logs tail
```

Shows live incoming events.



# Stripe Products Setup - SongPebble

## Create Product

1. Go to Stripe Dashboard → Products → Add product
2. Name: **Custom AI Song**
3. Pricing:
   - Standard pricing
   - One-time
   - £20
4. Billing options:
   - No trial
   - No metered usage

## Save the Price ID

Copy:

```
price_xxxxxxxxxxxxxx
```

Paste into `.env.local`:

```
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxx
```

## Optional future setups

### 1. Tiered pricing
Examples:
- Basic Song £20
- Premium Song £40
- Ultra Song £60

### 2. Subscription add-on
For creators wanting multiple songs per month.

## Important

Never expose the Price ID in code except directly in server-side API routes.  
Do not use it in client components.

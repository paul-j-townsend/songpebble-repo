# Stripe Setup Guide

## 1. Stripe Product

Product name: Custom AI Song  
Price: £20  
Mode: one_time  

Save PRICE_ID.

## 2. Environment Variables

STRIPE_SECRET_KEY  
STRIPE_WEBHOOK_SECRET  
SUPABASE_URL  
SUPABASE_KEY  
PRICE_ID  
BASE_URL  

## 3. Checkout Session

```js
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [{ price: process.env.PRICE_ID, quantity: 1 }],
  success_url: `${process.env.BASE_URL}/thank-you?order=${savedOrder.id}`,
  cancel_url: `${process.env.BASE_URL}/`,
});
```

## 4. Webhook

Event: checkout.session.completed

## 5. Refund Policy

Digital custom item = no refunds post delivery.


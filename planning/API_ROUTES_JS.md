
# API Routes - JavaScript Examples

This file shows JavaScript implementations of the core API routes.

## Supabase client

`src/lib/supabaseClient.js`:

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

## Stripe client

`src/lib/stripe.js`:

```js
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

## POST /api/create-order

`src/app/api/create-order/route.js` (Next App Router):

```js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    const body = await request.json();

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          email: body.email,
          genre: body.genre,
          vocal: body.vocal,
          names: body.names,
          catchphrases: body.catchphrases,
          mood: body.mood,
          custom_lines: body.customLines,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Could not create order." },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/thank-you?order=${order.id}`,
      cancel_url: `${process.env.BASE_URL}/`,
      metadata: {
        orderId: order.id,
      },
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected error creating order." },
      { status: 500 }
    );
  }
}
```

## POST /api/stripe-webhook

For Stripe webhooks in Next App Router you need raw body:

`src/app/api/stripe-webhook/route.js`:

```js
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req.body) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const orderId =
        session.metadata?.orderId || session.client_reference_id || null;

      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Error handling webhook:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
}
```

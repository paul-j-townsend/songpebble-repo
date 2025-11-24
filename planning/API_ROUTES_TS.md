
# API Routes - TypeScript Examples

## supabaseClient.ts

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);
```

## stripe.ts

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});
```

## POST /api/create-order (TypeScript)

`src/app/api/create-order/route.ts`:

```ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { stripe } from "@/lib/stripe";
import { songSchema } from "@/lib/songSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = songSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid form data." },
        { status: 400 }
      );
    }

    const values = parseResult.data;

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          email: values.email,
          genre: values.genre,
          vocal: values.vocal,
          names: values.names,
          catchphrases: values.catchphrases,
          mood: values.mood,
          custom_lines: values.customLines,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error || !order) {
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
          price: process.env.STRIPE_PRICE_ID as string,
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

## POST /api/stripe-webhook (TypeScript)

Note: For App Router, you need to read the raw body from the request stream.

```ts
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

async function getRawBody(req: Request): Promise<Buffer> {
  const reader = req.body?.getReader();
  const chunks: Uint8Array[] = [];

  if (!reader) {
    return Buffer.from("");
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request): Promise<Response> {
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
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

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Stripe from 'stripe'

/**
 * POST /api/stripe-webhook
 *
 * Handles Stripe webhook events
 *
 * Key events:
 * - checkout.session.completed: Payment successful, update order status to 'paid'
 *
 * IMPORTANT: This route must handle raw request body for signature verification
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('Processing checkout.session.completed:', session.id)

        // Get order ID from metadata
        const orderId = session.metadata?.order_id

        if (!orderId) {
          console.error('No order_id in session metadata:', session.id)
          return NextResponse.json(
            { error: 'Missing order_id in metadata' },
            { status: 400 }
          )
        }

        // Get the order to check current status
        const { data: existingOrder, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('status, stripe_session_id')
          .eq('id', orderId)
          .single()

        if (fetchError || !existingOrder) {
          console.error('Failed to fetch order:', orderId, fetchError)
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          )
        }

        // Idempotency check: Don't update if already paid
        if (existingOrder.status === 'paid') {
          console.log('Order already marked as paid:', orderId)
          return NextResponse.json({ received: true, skipped: true })
        }

        // Update order status to 'paid'
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: session.amount_total,
            currency: session.currency,
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Failed to update order status:', updateError)
          return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
          )
        }

        console.log('Order marked as paid:', orderId)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        if (orderId) {
          console.log('Checkout session expired for order:', orderId)
          // Optionally mark order as failed or leave as pending
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

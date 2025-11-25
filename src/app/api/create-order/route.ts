import { NextRequest, NextResponse } from 'next/server'
import { songFormSchema } from '@/lib/songSchema'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { stripe, getStripePriceId, getBaseUrl } from '@/lib/stripe'

/**
 * POST /api/create-order
 *
 * Creates a new order and initiates Stripe Checkout
 *
 * Flow:
 * 1. Validate form data with Zod
 * 2. Create order in Supabase with status 'pending'
 * 3. Create Stripe Checkout session
 * 4. Update order with stripe_session_id
 * 5. Return checkout URL to frontend
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = songFormSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const formData = validationResult.data

    // Step 1: Create order in Supabase with status 'pending'
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_email: formData.customerEmail,
        customer_name: formData.customerName,
        song_title: formData.songTitle,
        song_style: formData.songStyle,
        song_mood: formData.songMood || null,
        vocal_gender: formData.vocalGender || null,
        tempo: formData.tempo || null,
        instruments: formData.instruments || null,
        lyrics_input: formData.lyricsInput,
        status: 'pending',
        currency: 'gbp',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    console.log('Order created:', order.id)

    // Step 1.5: Insert characters if any were provided
    if (formData.characters && formData.characters.length > 0) {
      const charactersToInsert = formData.characters.map((char) => ({
        order_id: order.id,
        character_name: char.characterName,
        character_gender: char.characterGender || null,
        character_interests: char.characterInterests || null,
        character_mention: char.characterMention || null,
      }))

      const { error: charactersError } = await supabaseAdmin
        .from('characters')
        .insert(charactersToInsert)

      if (charactersError) {
        console.error('Failed to insert characters:', charactersError)
        // Delete the order since we couldn't insert characters
        await supabaseAdmin.from('orders').delete().eq('id', order.id)
        return NextResponse.json(
          { error: 'Failed to save character details' },
          { status: 500 }
        )
      }

      console.log(`Inserted ${formData.characters.length} character(s) for order ${order.id}`)
    }

    // Step 2: Create Stripe Checkout session
    const baseUrl = getBaseUrl()
    const priceId = getStripePriceId()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: formData.customerEmail,
      metadata: {
        order_id: order.id,
      },
      success_url: `${baseUrl}/thank-you?order_id=${order.id}`,
      cancel_url: `${baseUrl}?canceled=true`,
    })

    console.log('Stripe session created:', session.id)

    // Step 3: Update order with stripe_session_id
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        stripe_session_id: session.id,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order with session ID:', updateError)
      // Don't return error here - the order and session are created,
      // we can still proceed even if this update fails
    }

    // Step 4: Return checkout URL to frontend
    return NextResponse.json({
      checkoutUrl: session.url,
      orderId: order.id,
    })

  } catch (error) {
    console.error('Error in create-order API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

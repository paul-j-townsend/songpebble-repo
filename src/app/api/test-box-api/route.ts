import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { generateSongForOrder } from '@/lib/generateSong'

/**
 * POST /api/test-box-api
 *
 * Test endpoint to call API.box music generation API
 */
export async function POST(request: NextRequest) {
  console.log('🎵 [TEST API] Starting test song generation...')
  
  try {
    // Try to get form data from request body, otherwise use test data
    let formData: any = null
    try {
      const body = await request.json()
      formData = body
      console.log('📋 [TEST API] Received form data in request body')
    } catch {
      console.log('📋 [TEST API] No form data in request body, using test data')
    }

    console.log('📋 [TEST API] Step 1: Creating test order in database...')
    // Create a test order - use form data if provided, otherwise use defaults
    const { data: testOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_email: formData?.customerEmail || 'test@example.com',
        customer_name: formData?.customerName || 'Test User',
        song_title: formData?.songTitle || 'Test Song Generation - Dummy Track',
        song_style: formData?.songStyle || 'Indie Pop',
        song_mood: formData?.songMood || 'Joyful',
        vocal_gender: formData?.vocalGender || 'female',
        tempo: formData?.tempo || 'fast',
        instruments: formData?.instruments || ['piano', 'drums'],
        lyrics_input: formData?.lyricsInput || '', // Use form lyrics or empty to test generated prompt
        status: 'paid', // Mark as paid so webhook can process it
        currency: 'gbp',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError || !testOrder) {
      console.error('❌ [TEST API] Failed to create test order:', orderError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create test order',
          details: orderError?.message,
        },
        { status: 500 }
      )
    }
    console.log('✅ [TEST API] Test order created:', testOrder.id)

    // Add recipients and senders - use form data if provided, otherwise use test data
    console.log('📋 [TEST API] Step 1.5: Adding recipients and senders...')
    if (formData?.toCharacters && formData.toCharacters.length > 0) {
      const toCharactersToInsert = formData.toCharacters.map((char: any) => ({
        order_id: testOrder.id,
        character_name: char.characterName,
        character_gender: char.characterGender || null,
        character_interests: char.characterInterests || null,
        character_mention: char.characterMention || null,
      }))
      await supabaseAdmin.from('to_characters').insert(toCharactersToInsert)
      console.log(`✅ [TEST API] Added ${toCharactersToInsert.length} recipient(s) from form data`)
    } else {
      await supabaseAdmin.from('to_characters').insert({
        order_id: testOrder.id,
        character_name: 'Test Recipient',
        character_gender: 'male',
      })
      console.log('✅ [TEST API] Added test recipient')
    }

    if (formData?.senders && formData.senders.length > 0) {
      const sendersToInsert = formData.senders.map((sender: any) => ({
        order_id: testOrder.id,
        sender_name: sender.senderName,
      }))
      await supabaseAdmin.from('senders').insert(sendersToInsert)
      console.log(`✅ [TEST API] Added ${sendersToInsert.length} sender(s) from form data`)
    } else if (formData?.senderName) {
      // Handle single sender name from simplified form
      await supabaseAdmin.from('senders').insert({
        order_id: testOrder.id,
        sender_name: formData.senderName,
      })
      console.log('✅ [TEST API] Added sender from form data')
    } else {
      await supabaseAdmin.from('senders').insert({
        order_id: testOrder.id,
        sender_name: 'Test Sender',
      })
      console.log('✅ [TEST API] Added test sender')
    }

    console.log('📋 [TEST API] Step 2: Generating song using generateSongForOrder...')
    console.log('   → This will use the order\'s lyrics_input if present, or generate a prompt')
    console.log('   → Order lyrics_input:', testOrder.lyrics_input ? 'Present' : 'Empty (will generate prompt)')
    
    const result = await generateSongForOrder(testOrder.id)

    if (!result.success) {
      console.error('❌ [TEST API] Song generation failed:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate song',
          orderId: testOrder.id,
        },
        { status: 500 }
      )
    }

    console.log('✅ [TEST API] Step 3: Success!')
    console.log('   → Task ID:', result.taskId)
    console.log('   → Status: Music generation queued')
    console.log('   → Next: API.box will process and call webhook when complete')
    console.log('🎵 [TEST API] Test complete!')

    return NextResponse.json({
      success: true,
      message: 'Music generation queued successfully',
      taskId: result.taskId,
      orderId: testOrder.id,
    })
  } catch (error) {
    console.error('❌ [TEST API] Error calling API.box:', error)
    console.error('   → Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('   → Error message:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error('   → Stack trace:', error.stack)
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


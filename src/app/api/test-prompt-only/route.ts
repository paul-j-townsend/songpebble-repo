import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { generatePrompt } from '@/lib/promptGenerator'
import type { ToCharacter, Sender } from '@/lib/songSchema'

/**
 * TEST API: Generate song with ONLY prompt, NO style tags
 *
 * This endpoint tests what happens when we send only the Safe Mode prompt
 * to API.box without any separate style tags.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST PROMPT ONLY] Starting test...')

    const formData = await request.json()

    // Step 1: Create test order
    console.log('📋 [TEST] Creating test order...')
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_email: formData.customerEmail,
        customer_name: formData.customerName,
        occasion: formData.occasion || 'christmas',
        tone: formData.tone || null,
        song_title: formData.songTitle,
        song_style: formData.songStyle,
        song_mood: formData.songMood || null,
        vocal_gender: formData.vocalGender || null,
        tempo: formData.tempo || null,
        instruments: formData.instruments || null,
        lyrics_input: formData.lyricsInput || '',
        status: 'paid', // Set as paid so we can test
        currency: 'gbp',
      })
      .select()
      .single()

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`)
    }

    console.log(`✅ [TEST] Order created: ${order.id}`)

    // Step 2: Add recipients
    if (formData.toCharacters && formData.toCharacters.length > 0) {
      const toCharactersToInsert = formData.toCharacters.map((char: any) => ({
        order_id: order.id,
        character_name: char.characterName,
        character_gender: char.characterGender || null,
        character_interests: char.characterInterests || null,
        character_mention: char.characterMention || null,
      }))

      await supabaseAdmin.from('to_characters').insert(toCharactersToInsert)
      console.log(`✅ [TEST] Added ${formData.toCharacters.length} recipient(s)`)
    }

    // Step 3: Add senders
    if (formData.senders && formData.senders.length > 0) {
      const sendersToInsert = formData.senders.map((sender: any) => ({
        order_id: order.id,
        sender_name: sender.senderName,
      }))

      await supabaseAdmin.from('senders').insert(sendersToInsert)
      console.log(`✅ [TEST] Added ${formData.senders.length} sender(s)`)
    }

    // Step 4: Generate Safe Mode prompt
    const toCharacters: ToCharacter[] = formData.toCharacters || []
    const senders: Sender[] = formData.senders || []

    const prompt = generatePrompt(formData.occasion || 'christmas', {
      toCharacters,
      senders,
      tone: formData.tone,
      songStyle: formData.songStyle,
      songMood: formData.songMood,
      tempo: formData.tempo,
      instruments: formData.instruments,
      vocalGender: formData.vocalGender,
    })

    console.log('📋 [TEST] Generated Safe Mode prompt:')
    console.log(`   → Length: ${prompt.length} characters`)
    console.log(`   → First 200 chars: ${prompt.substring(0, 200)}...`)

    // Step 5: Send to API.box with ONLY prompt (no style field)
    const API_KEY = process.env.API_BOX_KEY
    if (!API_KEY) {
      throw new Error('API_BOX_KEY not set')
    }

    const baseUrl = process.env.NGROK_URL || process.env.BASE_URL || 'http://localhost:3000'
    const callBackUrl = `${baseUrl}/api/box-webhook?orderId=${order.id}`

    const payload = {
      customMode: true,
      instrumental: formData.vocalGender === 'instrumental',
      model: 'V5',
      callBackUrl,
      prompt,
      // NOTE: NO 'style' field - testing prompt-only approach
      title: formData.songTitle,
    }

    console.log('🎵 [TEST] Sending to API.box...')
    console.log('   → Payload includes: prompt, title, customMode, model')
    console.log('   → Payload EXCLUDES: style (testing prompt-only)')

    const API_BASE_URL = 'https://api.api.box'
    const response = await fetch(`${API_BASE_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('❌ [TEST] API.box request failed:', responseData)
      throw new Error(`API.box failed: ${response.status}`)
    }

    const taskId = responseData.data?.taskId

    console.log('✅ [TEST] Success!')
    console.log(`   → Task ID: ${taskId}`)
    console.log(`   → Order ID: ${order.id}`)
    console.log('   → API.box will process and call webhook when complete')

    // Update order
    await supabaseAdmin
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id)

    return NextResponse.json({
      success: true,
      taskId,
      orderId: order.id,
      message: 'Song generation started (PROMPT ONLY - no style tags)',
    })

  } catch (error) {
    console.error('❌ [TEST] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

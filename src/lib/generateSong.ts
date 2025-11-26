import { supabaseAdmin } from './supabaseAdmin'
import { buildChristmasStyle, generateChristmasPrompt } from './promptGenerator'
import type { ToCharacter, Sender } from './songSchema'

/**
 * Generates a song using API.box for a given order
 *
 * @param orderId - The order ID to generate a song for
 * @returns Success status and taskId if successful
 */
export async function generateSongForOrder(orderId: string): Promise<{
  success: boolean
  taskId?: string
  error?: string
}> {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return {
        success: false,
        error: `Order not found: ${orderError?.message || 'Unknown error'}`,
      }
    }

    // Fetch toCharacters (recipients) for this order
    const { data: toCharactersData, error: toCharactersError } = await supabaseAdmin
      .from('to_characters')
      .select('*')
      .eq('order_id', orderId)

    if (toCharactersError) {
      console.error('Failed to fetch to_characters:', toCharactersError)
    }

    // Fetch senders for this order
    const { data: sendersData, error: sendersError } = await supabaseAdmin
      .from('senders')
      .select('*')
      .eq('order_id', orderId)

    if (sendersError) {
      console.error('Failed to fetch senders:', sendersError)
    }

    // Transform database records to the format expected by generateChristmasPrompt
    const toCharacters: ToCharacter[] = (toCharactersData || []).map(char => ({
      characterName: char.character_name,
      characterGender: char.character_gender as 'male' | 'female' | 'other' | undefined,
      characterInterests: char.character_interests || undefined,
      characterMention: char.character_mention || undefined,
    }))

    const senders: Sender[] = (sendersData || []).map(sender => ({
      senderName: sender.sender_name,
    }))

    // Check if order is paid
    if (order.status !== 'paid') {
      return {
        success: false,
        error: `Order status must be 'paid' to generate song. Current status: ${order.status}`,
      }
    }

    const API_KEY = process.env.API_BOX_KEY
    if (!API_KEY) {
      return {
        success: false,
        error: 'API_BOX_KEY environment variable is not set',
      }
    }

    // Get base URL for webhook callback
    // Priority: NGROK_URL > BASE_URL > NEXT_PUBLIC_BASE_URL > localhost
    const baseUrl = process.env.NGROK_URL || process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const callBackUrl = `${baseUrl}/api/box-webhook?orderId=${orderId}`
    
    if (baseUrl.includes('localhost')) {
      console.warn('⚠️  [GENERATE SONG] Using localhost - API.box cannot reach webhook!')
      console.warn('   → Set NGROK_URL in .env.local for local development')
    }

    // Handle instruments (stored as JSONB, could be array or null)
    let instrumentsArray: string[] | null = null
    if (order.instruments) {
      if (Array.isArray(order.instruments)) {
        instrumentsArray = order.instruments
      } else if (typeof order.instruments === 'string') {
        try {
          const parsed = JSON.parse(order.instruments)
          instrumentsArray = Array.isArray(parsed) ? parsed : null
        } catch {
          instrumentsArray = null
        }
      }
    }

    // Use user-provided lyrics if available, otherwise generate prompt
    const lyricsInput = order.lyrics_input?.trim()
    const prompt = lyricsInput || generateChristmasPrompt({
      toCharacters,
      senders,
      songStyle: order.song_style,
      songMood: order.song_mood || undefined,
      tempo: order.tempo || undefined,
      instruments: instrumentsArray || undefined,
      vocalGender: order.vocal_gender || undefined,
    })
    
    console.log(`[GENERATE SONG] Prompt source: ${lyricsInput ? 'user-provided lyrics_input' : 'generated prompt'}`)
    console.log(`[GENERATE SONG] Prompt length: ${prompt.length} characters`)
    console.log(`[GENERATE SONG] Prompt preview: ${prompt.substring(0, 100)}...`)

    // Build rich style description combining Christmas elements with user preferences
    const style = buildChristmasStyle({
      songStyle: order.song_style,
      songMood: order.song_mood || undefined,
      tempo: order.tempo || undefined,
      instruments: instrumentsArray || undefined,
      vocalGender: order.vocal_gender || undefined,
    })

    // Prepare API.box request payload
    const payload = {
      customMode: true,
      instrumental: order.vocal_gender === 'instrumental',
      model: 'V5', // Using V5 for cutting-edge quality and enhanced capabilities
      callBackUrl,
      prompt,
      style,
      title: order.song_title,
    }

    // Call API.box
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
      console.error('API.box request failed:', responseData)
      return {
        success: false,
        error: `API.box request failed: ${response.status} - ${JSON.stringify(responseData)}`,
      }
    }

    const taskId = responseData.data?.taskId
    if (!taskId) {
      return {
        success: false,
        error: 'No taskId in API.box response',
      }
    }

    // Update order status to 'processing'
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    console.log(`Song generation started for order ${orderId}, taskId: ${taskId}`)

    return {
      success: true,
      taskId,
    }
  } catch (error) {
    console.error('Error generating song:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

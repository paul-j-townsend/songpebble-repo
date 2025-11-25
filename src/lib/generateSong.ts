import { supabaseAdmin } from './supabaseAdmin'

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

    // Build prompt from order details
    const prompt = buildPromptFromOrder({
      song_title: order.song_title,
      song_style: order.song_style,
      song_mood: order.song_mood,
      lyrics_input: order.lyrics_input,
      vocal_gender: order.vocal_gender,
      tempo: order.tempo,
      instruments: instrumentsArray,
    })

    // Prepare API.box request payload
    const payload = {
      customMode: true,
      instrumental: order.vocal_gender === 'instrumental',
      model: 'V4_5', // Using V4_5 for good balance of quality and speed
      callBackUrl,
      prompt,
      style: order.song_style,
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

/**
 * Builds a prompt for API.box from order details
 */
function buildPromptFromOrder(order: {
  song_title: string
  song_style: string
  song_mood: string | null
  lyrics_input: string
  vocal_gender: string | null
  tempo: string | null
  instruments: string[] | null
}): string {
  let prompt = order.lyrics_input

  // Add style and mood context
  if (order.song_style) {
    prompt = `${order.song_style} style. ${prompt}`
  }

  if (order.song_mood) {
    prompt = `${prompt} Mood: ${order.song_mood}.`
  }

  // Add tempo if specified
  if (order.tempo) {
    const tempoMap: Record<string, string> = {
      slow: 'slow tempo',
      medium: 'medium tempo',
      fast: 'fast tempo',
      'very-fast': 'very fast tempo',
    }
    if (tempoMap[order.tempo]) {
      prompt = `${prompt} ${tempoMap[order.tempo]}.`
    }
  }

  // Add instruments if specified
  if (order.instruments && order.instruments.length > 0) {
    prompt = `${prompt} Instruments: ${order.instruments.join(', ')}.`
  }

  return prompt
}


import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * POST /api/test-box-api
 *
 * Test endpoint to call API.box music generation API
 */
export async function POST(request: NextRequest) {
  console.log('🎵 [TEST API] Starting test song generation...')
  
  try {
    console.log('📋 [TEST API] Step 1: Checking API key...')
    const API_KEY = process.env.API_BOX_KEY
    const API_BASE_URL = 'https://api.api.box'

    if (!API_KEY) {
      console.error('❌ [TEST API] API_BOX_KEY environment variable is not set')
      return NextResponse.json(
        {
          success: false,
          error: 'API_BOX_KEY environment variable is not set',
        },
        { status: 500 }
      )
    }
    console.log('✅ [TEST API] API key found:', API_KEY.substring(0, 10) + '...')

    console.log('📋 [TEST API] Step 2: Creating test order in database...')
    // Create a test order so the webhook can update it
    const { data: testOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        song_title: 'Test Song Generation - Dummy Track',
        song_style: 'Indie Pop',
        song_mood: 'Joyful',
        lyrics_input: 'A joyful indie pop song about friendship and celebration. Upbeat tempo with catchy melodies and harmonies.',
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

    console.log('📋 [TEST API] Step 3: Building webhook callback URL...')
    // Get base URL for webhook callback
    // Priority: NGROK_URL > BASE_URL > NEXT_PUBLIC_BASE_URL > localhost
    const baseUrl = process.env.NGROK_URL || process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const callBackUrl = `${baseUrl}/api/box-webhook?orderId=${testOrder.id}`
    console.log('✅ [TEST API] Callback URL:', callBackUrl)
    console.log('   → Order ID included:', testOrder.id)
    if (baseUrl.includes('localhost')) {
      console.warn('   ⚠️  WARNING: Using localhost - API.box cannot reach this!')
      console.warn('   ⚠️  Use ngrok: ./start-ngrok.sh and set NGROK_URL in .env.local')
    } else if (baseUrl.includes('ngrok')) {
      console.log('   ✅ Using ngrok URL - webhooks will work automatically!')
    }

    console.log('📋 [TEST API] Step 4: Preparing test payload...')
    // Test payload for song generation with dummy data
    const testPayload = {
      customMode: true,
      instrumental: false,
      model: 'V4_5',
      callBackUrl, // Webhook endpoint to receive completion notification
      prompt: 'A joyful indie pop song about friendship and celebration. Upbeat tempo with catchy melodies and harmonies.',
      style: 'Indie Pop',
      title: 'Test Song Generation - Dummy Track',
    }
    console.log('✅ [TEST API] Payload prepared:', {
      ...testPayload,
      callBackUrl: callBackUrl.substring(0, 50) + '...',
    })

    console.log('📋 [TEST API] Step 5: Sending request to API.box...')
    console.log('   → Endpoint:', `${API_BASE_URL}/api/v1/generate`)
    console.log('   → Method: POST')
    
    const response = await fetch(`${API_BASE_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    console.log('📋 [TEST API] Step 6: Processing response...')
    console.log('   → Status:', response.status, response.statusText)
    console.log('   → Headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('   → Raw response text:', responseText)
    
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('   → Parsed response data:', JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.error('   ❌ Failed to parse JSON response:', parseError)
      console.error('   → Response was:', responseText)
      throw new Error('Invalid JSON response from API.box')
    }

    // Check both HTTP status and API response code
    // API.box may return HTTP 200 but with error code in JSON body
    const apiCode = responseData.code
    const apiMessage = responseData.msg || responseData.message

    if (!response.ok) {
      console.error('❌ [TEST API] HTTP request failed')
      console.error('   → HTTP Status:', response.status)
      console.error('   → API Code:', apiCode)
      console.error('   → API Message:', apiMessage)
      console.error('   → Full Response:', responseData)
      return NextResponse.json(
        {
          success: false,
          error: apiMessage || 'API request failed',
          httpStatus: response.status,
          apiCode: apiCode,
          data: responseData,
        },
        { status: response.status }
      )
    }

    // Check if we actually got a successful response (API.box returns code in JSON)
    if (apiCode && apiCode !== 200) {
      console.error('❌ [TEST API] API returned error code in response body')
      console.error('   → HTTP Status:', response.status, '(but API code indicates error)')
      console.error('   → API Code:', apiCode)
      console.error('   → API Message:', apiMessage)
      console.error('   → Full Response:', responseData)
      return NextResponse.json(
        {
          success: false,
          error: apiMessage || `API returned error code: ${apiCode}`,
          httpStatus: response.status,
          apiCode: apiCode,
          data: responseData,
        },
        { status: 500 }
      )
    }

    // Try different possible response structures for taskId
    const taskId = responseData.data?.taskId || responseData.taskId || responseData.task_id || responseData.id
    console.log('✅ [TEST API] Step 7: Success!')
    console.log('   → Full response structure:', {
      hasData: !!responseData.data,
      dataKeys: responseData.data ? Object.keys(responseData.data) : [],
      topLevelKeys: Object.keys(responseData),
      taskIdFound: taskId,
    })
    console.log('   → Task ID:', taskId || 'NOT FOUND')
    console.log('   → Status: Music generation queued')
    console.log('   → Next: API.box will process and call webhook when complete')
    console.log('   → Webhook URL:', callBackUrl)
    console.log('   ⚠️  Note: For test calls without orderId, webhook will fail but that\'s expected')
    console.log('🎵 [TEST API] Test complete!')

    if (!taskId) {
      console.warn('   ⚠️  WARNING: No taskId found in response. Check API.box response structure.')
    }

    return NextResponse.json({
      success: true,
      message: 'Music generation queued successfully',
      data: responseData,
      taskId: taskId || null,
      orderId: testOrder.id, // Include order ID so user can track it
      rawResponse: responseData, // Include full response for debugging
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


import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * POST /api/box-webhook
 *
 * Webhook handler for API.box music generation callbacks
 *
 * Expected payload from API.box:
 * {
 *   taskId: string,
 *   status: 'completed' | 'failed',
 *   downloadUrl?: string,  // URL to download the generated song
 *   lyricsUrl?: string,     // URL to download lyrics (if available)
 *   orderId?: string,       // If we passed it in the callback URL
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
  console.log('🎵 [WEBHOOK] Received API.box webhook callback')
  
  try {
    console.log('📋 [WEBHOOK] Step 1: Parsing webhook payload...')
    console.log('   → Request URL:', request.url)
    console.log('   → Request method:', request.method)
    console.log('   → Content-Type:', request.headers.get('content-type'))
    
    // Try to get raw body first for debugging
    const rawBody = await request.text()
    console.log('   → Raw body (first 500 chars):', rawBody.substring(0, 500))
    
    let body
    try {
      body = JSON.parse(rawBody)
      console.log('   → Parsed payload:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error('   ❌ Failed to parse JSON:', parseError)
      console.error('   → Raw body:', rawBody)
      return NextResponse.json(
        { error: 'Invalid JSON payload', rawBody: rawBody.substring(0, 200) },
        { status: 400 }
      )
    }
    
    const { taskId, status, downloadUrl, lyricsUrl, orderId: bodyOrderId } = body

    // Get orderId from query params (if passed in callback URL) or from body
    const { searchParams } = new URL(request.url)
    const queryOrderId = searchParams.get('orderId')
    const orderIdToUpdate = bodyOrderId || queryOrderId

    console.log('📋 [WEBHOOK] Step 2: Extracting webhook data...')
    console.log('   → Task ID:', taskId)
    console.log('   → Status:', status)
    console.log('   → Download URL:', downloadUrl ? 'Present' : 'Missing')
    console.log('   → Lyrics URL:', lyricsUrl ? 'Present' : 'Missing')
    console.log('   → Order ID (body):', bodyOrderId || 'Not provided')
    console.log('   → Order ID (query):', queryOrderId || 'Not provided')
    console.log('   → Order ID (final):', orderIdToUpdate || 'MISSING')

    if (!taskId) {
      console.error('❌ [WEBHOOK] Missing taskId in webhook payload')
      return NextResponse.json(
        { error: 'Missing taskId in webhook payload' },
        { status: 400 }
      )
    }

    if (!orderIdToUpdate) {
      console.error('❌ [WEBHOOK] Missing orderId')
      console.error('   → This is a test webhook. For real orders, include ?orderId={orderId} in callback URL')
      return NextResponse.json(
        { error: 'Missing orderId. Please include it in the callback URL as ?orderId={orderId}' },
        { status: 400 }
      )
    }

    console.log('📋 [WEBHOOK] Step 3: Looking up order in database...')
    // Find the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderIdToUpdate)
      .single()

    if (orderError || !order) {
      console.error('❌ [WEBHOOK] Order not found:', orderIdToUpdate, orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    console.log('✅ [WEBHOOK] Order found:', { id: order.id, status: order.status })

    if (status === 'completed' && downloadUrl) {
      console.log('📋 [WEBHOOK] Step 4: Song generation completed!')
      console.log('   → Downloading and storing song...')
      // Download and store the song
      const storageResult = await downloadAndStoreSong(
        downloadUrl,
        orderIdToUpdate,
        lyricsUrl
      )
      
      console.log('📋 [WEBHOOK] Step 5: Storage result:', storageResult)

      if (!storageResult.success) {
        console.error('❌ [WEBHOOK] Failed to download and store song')
        console.error('   → Error:', storageResult.error)
        // Update order status to failed
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderIdToUpdate)

        return NextResponse.json(
          { error: 'Failed to download and store song', details: storageResult.error },
          { status: 500 }
        )
      }

      console.log('✅ [WEBHOOK] Step 6: Files stored successfully')
      console.log('   → MP3 path:', storageResult.mp3Path || 'N/A')
      console.log('   → WAV path:', storageResult.wavPath || 'N/A')
      console.log('   → Lyrics path:', storageResult.lyricsPath || 'N/A')

      console.log('📋 [WEBHOOK] Step 7: Updating order status to "delivered"...')
      // Update order with file paths and mark as delivered
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'delivered',
          mp3_url: storageResult.mp3Path,
          wav_url: storageResult.wavPath,
          lyrics_url: storageResult.lyricsPath,
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderIdToUpdate)

      if (updateError) {
        console.error('❌ [WEBHOOK] Failed to update order:', updateError)
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        )
      }

      console.log('✅ [WEBHOOK] Order delivered successfully!')
      console.log('   → Order ID:', orderIdToUpdate)
      console.log('🎵 [WEBHOOK] Webhook processing complete!')
      return NextResponse.json({ success: true, orderId: orderIdToUpdate })
    }

    if (status === 'failed') {
      console.error('❌ [WEBHOOK] Song generation failed')
      console.error('   → Task ID:', taskId)
      // Update order status to failed
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderIdToUpdate)

      return NextResponse.json({ success: true, message: 'Order marked as failed' })
    }

    console.log('📋 [WEBHOOK] Webhook received but status is:', status)
    return NextResponse.json({ success: true, message: 'Webhook received' })
  } catch (error) {
    console.error('Error processing API.box webhook:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Downloads a song from API.box and stores it in Supabase Storage
 */
async function downloadAndStoreSong(
  downloadUrl: string,
  orderId: string,
  lyricsUrl?: string
): Promise<{
  success: boolean
  mp3Path?: string
  wavPath?: string
  lyricsPath?: string
  error?: string
}> {
  try {
    console.log('   📥 [STORAGE] Downloading audio file...')
    console.log('      → URL:', downloadUrl)
    // Download the audio file
    const audioResponse = await fetch(downloadUrl)
    if (!audioResponse.ok) {
      console.error('   ❌ [STORAGE] Failed to download audio:', audioResponse.statusText)
      return {
        success: false,
        error: `Failed to download audio: ${audioResponse.statusText}`,
      }
    }

    console.log('   ✅ [STORAGE] Audio file downloaded')
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg'
    console.log('      → Content type:', contentType)
    console.log('      → File size:', (audioBuffer.length / 1024).toFixed(2), 'KB')
    
    // Determine file extension from content type
    const extension = contentType.includes('wav') ? 'wav' : 'mp3'
    const fileName = `song.${extension}`
    console.log('      → File extension:', extension)
    console.log('      → File name:', fileName)

    // Upload to Supabase Storage
    const storagePath = `${orderId}/${fileName}`
    console.log('   📤 [STORAGE] Uploading to Supabase Storage...')
    console.log('      → Bucket: tracks')
    console.log('      → Path:', storagePath)
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('tracks')
      .upload(storagePath, audioBuffer, {
        contentType,
        upsert: true, // Overwrite if exists
      })

    if (uploadError) {
      console.error('   ❌ [STORAGE] Failed to upload to storage:', uploadError)
      return {
        success: false,
        error: `Failed to upload to storage: ${uploadError.message}`,
      }
    }

    console.log('   ✅ [STORAGE] Audio file uploaded successfully')
    console.log('      → Upload data:', uploadData)

    const mp3Path = extension === 'mp3' ? storagePath : undefined
    const wavPath = extension === 'wav' ? storagePath : undefined

    // Download and store lyrics if available
    let lyricsPath: string | undefined
    if (lyricsUrl) {
      console.log('   📥 [STORAGE] Downloading lyrics file...')
      console.log('      → URL:', lyricsUrl)
      try {
        const lyricsResponse = await fetch(lyricsUrl)
        if (lyricsResponse.ok) {
          console.log('   ✅ [STORAGE] Lyrics file downloaded')
          const lyricsText = await lyricsResponse.text()
          const lyricsBuffer = Buffer.from(lyricsText, 'utf-8')
          console.log('      → Lyrics size:', lyricsBuffer.length, 'bytes')
          
          const lyricsStoragePath = `${orderId}/lyrics.txt`
          console.log('   📤 [STORAGE] Uploading lyrics to Supabase Storage...')
          console.log('      → Bucket: lyrics')
          console.log('      → Path:', lyricsStoragePath)
          
          const { error: lyricsUploadError } = await supabaseAdmin.storage
            .from('lyrics')
            .upload(lyricsStoragePath, lyricsBuffer, {
              contentType: 'text/plain',
              upsert: true,
            })

          if (!lyricsUploadError) {
            lyricsPath = lyricsStoragePath
            console.log('   ✅ [STORAGE] Lyrics file uploaded successfully')
          } else {
            console.error('   ❌ [STORAGE] Failed to upload lyrics:', lyricsUploadError)
          }
        } else {
          console.warn('   ⚠️ [STORAGE] Lyrics download failed:', lyricsResponse.statusText)
        }
      } catch (error) {
        console.error('   ❌ [STORAGE] Failed to download/upload lyrics:', error)
        // Don't fail the whole process if lyrics fail
      }
    } else {
      console.log('   ℹ️ [STORAGE] No lyrics URL provided, skipping lyrics download')
    }

    console.log('   ✅ [STORAGE] All files stored successfully')
    return {
      success: true,
      mp3Path,
      wavPath,
      lyricsPath,
    }
  } catch (error) {
    console.error('   ❌ [STORAGE] Error in downloadAndStoreSong:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}


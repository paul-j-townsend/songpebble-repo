import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Import the download and store function
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
    
    const extension = contentType.includes('wav') ? 'wav' : 'mp3'
    const fileName = `song.${extension}`
    console.log('      → File extension:', extension)

    const storagePath = `${orderId}/${fileName}`
    console.log('   📤 [STORAGE] Uploading to Supabase Storage...')
    console.log('      → Bucket: tracks')
    console.log('      → Path:', storagePath)
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('tracks')
      .upload(storagePath, audioBuffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error('   ❌ [STORAGE] Failed to upload to storage:', uploadError)
      return {
        success: false,
        error: `Failed to upload to storage: ${uploadError.message}`,
      }
    }

    console.log('   ✅ [STORAGE] Audio file uploaded successfully')

    const mp3Path = extension === 'mp3' ? storagePath : undefined
    const wavPath = extension === 'wav' ? storagePath : undefined

    let lyricsPath: string | undefined
    if (lyricsUrl) {
      console.log('   📥 [STORAGE] Downloading lyrics file...')
      try {
        const lyricsResponse = await fetch(lyricsUrl)
        if (lyricsResponse.ok) {
          const lyricsText = await lyricsResponse.text()
          const lyricsBuffer = Buffer.from(lyricsText, 'utf-8')
          const lyricsStoragePath = `${orderId}/lyrics.txt`
          const { error: lyricsUploadError } = await supabaseAdmin.storage
            .from('lyrics')
            .upload(lyricsStoragePath, lyricsBuffer, {
              contentType: 'text/plain',
              upsert: true,
            })
          if (!lyricsUploadError) {
            lyricsPath = lyricsStoragePath
            console.log('   ✅ [STORAGE] Lyrics file uploaded successfully')
          }
        }
      } catch (error) {
        console.error('   ❌ [STORAGE] Failed to download/upload lyrics:', error)
      }
    }

    return {
      success: true,
      mp3Path,
      wavPath,
      lyricsPath,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * POST /api/test-webhook-manual
 * 
 * Manually trigger the webhook handler with test data
 * Use this when API.box can't reach localhost
 * 
 * Body should contain:
 * {
 *   taskId: string,
 *   status: 'completed',
 *   downloadUrl: string,
 *   lyricsUrl?: string,
 *   orderId: string
 * }
 */
export async function POST(request: NextRequest) {
  console.log('🧪 [MANUAL WEBHOOK] Manual webhook trigger received')
  
  try {
    const body = await request.json()
    const { taskId, status, downloadUrl, lyricsUrl, orderId } = body

    if (!taskId || !status || !downloadUrl || !orderId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['taskId', 'status', 'downloadUrl', 'orderId'],
          received: Object.keys(body),
        },
        { status: 400 }
      )
    }

    console.log('🧪 [MANUAL WEBHOOK] Processing webhook...')
    console.log('   → Task ID:', taskId)
    console.log('   → Status:', status)
    console.log('   → Order ID:', orderId)
    console.log('   → Download URL:', downloadUrl)

    // Check if order exists
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [MANUAL WEBHOOK] Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found', orderId },
        { status: 404 }
      )
    }

    if (status === 'completed' && downloadUrl) {
      console.log('📋 [MANUAL WEBHOOK] Downloading and storing song...')
      const storageResult = await downloadAndStoreSong(downloadUrl, orderId, lyricsUrl)

      if (!storageResult.success) {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', orderId)

        return NextResponse.json(
          { error: 'Failed to download and store song', details: storageResult.error },
          { status: 500 }
        )
      }

      console.log('📋 [MANUAL WEBHOOK] Updating order to delivered...')
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
        .eq('id', orderId)

      if (updateError) {
        console.error('❌ [MANUAL WEBHOOK] Failed to update order:', updateError)
        return NextResponse.json(
          { error: 'Failed to update order', details: updateError.message },
          { status: 500 }
        )
      }

      console.log('✅ [MANUAL WEBHOOK] Order delivered successfully!')
      return NextResponse.json({
        success: true,
        message: 'Song downloaded and stored successfully',
        orderId,
        storagePaths: {
          mp3: storageResult.mp3Path,
          wav: storageResult.wavPath,
          lyrics: storageResult.lyricsPath,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      status,
    })
  } catch (error) {
    console.error('❌ [MANUAL WEBHOOK] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


'use client'

import { useState } from 'react'

export default function TestApiButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    taskId?: string
    error?: string
    apiCode?: number
  } | null>(null)

  const handleTestApi = async () => {
    console.log('🎵 [TEST BUTTON] User clicked "Test API.box" button')
    setIsLoading(true)
    setResult(null)

    try {
      console.log('📋 [TEST BUTTON] Step 1: Sending request to /api/test-box-api...')
      const response = await fetch('/api/test-box-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📋 [TEST BUTTON] Step 2: Received response')
      console.log('   → Status:', response.status, response.statusText)
      console.log('   → OK:', response.ok)

      const data = await response.json()
      console.log('📋 [TEST BUTTON] Step 3: Parsed response data:', data)

      if (data.success) {
        console.log('✅ [TEST BUTTON] Success!')
        console.log('   → Task ID:', data.taskId)
        console.log('   → Message:', data.message)
        if (!data.taskId) {
          console.warn('   ⚠️  WARNING: No taskId received. Check server logs for details.')
        }
        console.log('   → Next: Check server logs for API.box webhook when song is ready')
        console.log('   → Note: Webhook requires orderId, so test calls may not complete fully')
      } else {
        console.error('❌ [TEST BUTTON] Request failed')
        console.error('   → Error:', data.error)
        console.error('   → API Code:', data.apiCode || 'N/A')
        console.error('   → Full response:', data)
        if (data.apiCode === 429) {
          console.error('   ⚠️  INSUFFICIENT CREDITS: Please top up your API.box account')
        }
      }

      setResult(data)
    } catch (error) {
      console.error('❌ [TEST BUTTON] Network or parsing error:', error)
      console.error('   → Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('   → Error message:', error instanceof Error ? error.message : String(error))
      
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      console.log('📋 [TEST BUTTON] Request complete, updating UI...')
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 border border-christmas-gold rounded-lg bg-white">
      <button
        onClick={handleTestApi}
        disabled={isLoading}
        className="px-4 py-2 bg-christmas-red text-white rounded hover:bg-christmas-red-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Testing API...' : 'Test API.box'}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-christmas-green bg-opacity-10 border border-christmas-green' : 'bg-christmas-red bg-opacity-10 border border-christmas-red'}`}>
          {result.success ? (
            <div>
              <p className="text-christmas-green-dark font-semibold">✅ {result.message}</p>
              {result.taskId && (
                <p className="text-sm text-christmas-green-dark mt-2">
                  Task ID: <code className="bg-christmas-green bg-opacity-20 px-2 py-1 rounded">{result.taskId}</code>
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-christmas-red-dark font-semibold">❌ Error</p>
              <p className="text-sm text-christmas-red-dark mt-2">{result.error || 'Unknown error occurred'}</p>
              {result.apiCode === 429 && (
                <p className="text-sm text-christmas-red-dark mt-2 font-semibold">
                  ⚠️ Insufficient credits - Please top up your API.box account
                </p>
              )}
              {result.apiCode && (
                <p className="text-xs text-christmas-red-dark mt-1">API Code: {result.apiCode}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


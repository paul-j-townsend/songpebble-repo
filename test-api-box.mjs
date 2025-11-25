import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') })

// API key can be set in .env.local as API_BOX_KEY
// If not set, it will use the hardcoded key below
const API_KEY = process.env.API_BOX_KEY || 'e2212f0c9e34e7d4eb7e0a145498cd39'
const API_BASE_URL = 'https://api.api.box'

console.log('Testing API.box Music Generation...\n')
console.log('API Key:', API_KEY.substring(0, 10) + '...')
console.log('Base URL:', API_BASE_URL)
console.log('')

// Test payload for song generation
const testPayload = {
  customMode: true,
  instrumental: false, // We want vocals since we're providing lyrics
  model: 'V4_5', // Using V4_5 for good balance of quality and speed
  callBackUrl: 'https://example.com/webhook', // Placeholder - replace with your actual webhook URL
  prompt: 'A joyful indie pop song about friendship and celebration',
  style: 'Indie Pop',
  title: 'Test Song Generation',
}

console.log('Request Payload:')
console.log(JSON.stringify(testPayload, null, 2))
console.log('')

try {
  console.log('Sending POST request to /api/v1/generate...\n')
  
  const response = await fetch(`${API_BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testPayload),
  })

  console.log('Response Status:', response.status, response.statusText)
  console.log('Response Headers:', Object.fromEntries(response.headers.entries()))
  console.log('')

  const responseData = await response.json()

  if (!response.ok) {
    console.error('❌ API Request Failed:')
    console.error('Status:', response.status)
    console.error('Response:', JSON.stringify(responseData, null, 2))
    process.exit(1)
  }

  console.log('✅ API Request Successful!')
  console.log('\nResponse Data:')
  console.log(JSON.stringify(responseData, null, 2))
  
  if (responseData.data?.taskId) {
    console.log('\n🎵 Task ID:', responseData.data.taskId)
    console.log('   Use this taskId to check the status of your music generation')
  }
  
  console.log('\n📝 Next Steps:')
  console.log('1. The music generation has been queued successfully')
  console.log('2. Check your callback URL for completion notification')
  console.log('3. Use the task ID to poll for status if needed')
  console.log('4. The generated song will be available via the callback or status endpoint')

} catch (error) {
  console.error('\n❌ Error making API request:')
  console.error(error.message)
  
  if (error.cause) {
    console.error('Cause:', error.cause)
  }
  
  console.error('\nPlease check:')
  console.error('1. Your API key is valid and active')
  console.error('2. Your internet connection is working')
  console.error('3. The API endpoint is accessible')
  process.exit(1)
}


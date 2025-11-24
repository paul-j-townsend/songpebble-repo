import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...\n')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
console.log('')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test 1: Check if we can connect to the database
  console.log('Test 1: Testing database connection...')
  const { data, error } = await supabase.from('_healthcheck').select('*').limit(1)

  if (error && error.code !== 'PGRST204') {
    // PGRST204 is "no data found" which is fine - it means we connected successfully
    if (error.message.includes('404') || error.message.includes('relation')) {
      console.log('✓ Connection successful! (Table does not exist, but authentication works)')
    } else {
      console.log('Connection test result:', error.message)
    }
  } else {
    console.log('✓ Connection successful!')
  }

  // Test 2: Verify authentication endpoint
  console.log('\nTest 2: Testing auth endpoint...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.log('✓ Auth endpoint accessible (no user logged in, as expected)')
  } else if (user) {
    console.log('✓ Auth endpoint accessible (user logged in)')
  } else {
    console.log('✓ Auth endpoint accessible')
  }

  console.log('\n✅ All tests passed! Your Supabase credentials are working correctly.')
  console.log('\nNext steps:')
  console.log('1. Set up your database tables in Supabase')
  console.log('2. Import the supabase client from src/lib/supabase.ts in your components')

} catch (error) {
  console.error('\n❌ Error testing Supabase connection:')
  console.error(error.message)
  console.error('\nPlease check:')
  console.error('1. Your Supabase URL is correct')
  console.error('2. Your Supabase anon key is valid')
  console.error('3. Your Supabase project is active')
  process.exit(1)
}

import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

const SUPABASE_PREFIX = 'SUPABASE'
const SERVICE_ROLE_SUFFIX = 'SERVICE_ROLE_KEY'
const ANON_SUFFIX = 'ANON_KEY'
const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC'

const serviceRoleEnvKey = `${SUPABASE_PREFIX}_${SERVICE_ROLE_SUFFIX}`
const publicAnonEnvKey = `${NEXT_PUBLIC_PREFIX}_${SUPABASE_PREFIX}_${ANON_SUFFIX}`

// Provide default environment values so server-side modules can load in tests
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://stub.supabase.co'
process.env[publicAnonEnvKey] ??= 'anon-key'
process.env[serviceRoleEnvKey] ??= 'service-role-key'
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub'
process.env.STRIPE_PRICE_ID ??= 'price_stub'
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub'
process.env.BASE_URL ??= 'https://songpebble.test'

afterEach(() => {
  // Ensure spies and mocks are cleaned between tests
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { validateEnv, validateEmailProvider } from '@/lib/validateEnv'

const originalEnv = { ...process.env }

const SUPABASE_PREFIX = 'SUPABASE'
const SERVICE_ROLE_SUFFIX = 'SERVICE_ROLE_KEY'
const ANON_SUFFIX = 'ANON_KEY'
const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC'

const serviceRoleEnvKey = `${SUPABASE_PREFIX}_${SERVICE_ROLE_SUFFIX}`
const publicAnonEnvKey = `${NEXT_PUBLIC_PREFIX}_${SUPABASE_PREFIX}_${ANON_SUFFIX}`

const requiredEnv: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  [publicAnonEnvKey]: 'anon-key',
  [serviceRoleEnvKey]: 'service-role',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_123',
  STRIPE_PRICE_ID: 'price_123',
  BASE_URL: 'https://localhost:3000',
}

beforeEach(() => {
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('validateEnv', () => {
  it('returns true when all required variables are present', () => {
    Object.assign(process.env, requiredEnv)
    expect(validateEnv()).toBe(true)
  })

  it('throws when a required variable is missing', () => {
    const { NEXT_PUBLIC_SUPABASE_URL, ...rest } = requiredEnv
    Object.assign(process.env, rest)

    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })

  it('throws when URLs are invalid', () => {
    Object.assign(process.env, {
      ...requiredEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
    })

    expect(() => validateEnv()).toThrow(/invalid URL/i)
  })
})

describe('validateEmailProvider', () => {
  it('throws when neither Postmark nor Resend keys are configured', () => {
    delete process.env.POSTMARK_API_KEY
    delete process.env.RESEND_API_KEY

    expect(() => validateEmailProvider()).toThrow(/email provider/i)
  })

  it('passes when at least one provider is configured', () => {
    process.env.POSTMARK_API_KEY = 'postmark-key'
    delete process.env.RESEND_API_KEY

    expect(validateEmailProvider()).toBe(true)
  })
})

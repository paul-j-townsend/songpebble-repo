import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

const originalEnv = { ...process.env }

describe('Stripe helper functions', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_PRICE_ID = 'price_123'
    process.env.BASE_URL = 'https://songpebble.test'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns configured price ID and base URL', async () => {
    const { getStripePriceId, getBaseUrl } = await import('@/lib/stripe')
    expect(getStripePriceId()).toBe('price_123')
    expect(getBaseUrl()).toBe('https://songpebble.test')
  })

  it('throws if STRIPE_PRICE_ID is missing', async () => {
    delete process.env.STRIPE_PRICE_ID
    const { getStripePriceId } = await import('@/lib/stripe')
    expect(() => getStripePriceId()).toThrow(/STRIPE_PRICE_ID/)
  })

  it('throws if BASE_URL is missing', async () => {
    delete process.env.BASE_URL
    const { getBaseUrl } = await import('@/lib/stripe')
    expect(() => getBaseUrl()).toThrow(/BASE_URL/)
  })
})

import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/create-order/route'

const insertMock = vi.fn()
const selectMock = vi.fn()
const singleMock = vi.fn()
const updateMock = vi.fn()
const eqMock = vi.fn()

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: () => ({
      insert: insertMock,
      update: updateMock,
    }),
  },
}))

const checkoutCreateMock = vi.fn()

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: checkoutCreateMock,
      },
    },
  },
  getBaseUrl: () => 'https://songpebble.test',
  getStripePriceId: () => 'price_123',
}))

const validPayload = {
  customerEmail: 'listener@example.com',
  customerName: 'Listener',
  songTitle: 'Ballad',
  songStyle: 'Pop',
  songMood: 'Happy',
  lyricsInput: 'Lyrics that meet the ten character minimum.',
}

const createRequest = (body: unknown) => ({
  json: async () => body,
}) as NextRequest

beforeEach(() => {
  vi.clearAllMocks()

  insertMock.mockImplementation(() => ({ select: selectMock }))
  selectMock.mockImplementation(() => ({ single: singleMock }))
  updateMock.mockImplementation(() => ({ eq: eqMock }))
  eqMock.mockResolvedValue({ error: null })

  singleMock.mockResolvedValue({
    data: {
      id: 'order-123',
      customer_email: validPayload.customerEmail,
    },
    error: null,
  })

  checkoutCreateMock.mockResolvedValue({
    id: 'cs_test_123',
    url: 'https://stripe.test/checkout',
  })
})

describe('/api/create-order', () => {
  it('creates an order and returns a checkout URL when input is valid', async () => {
    const response = await POST(createRequest(validPayload))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.checkoutUrl).toBe('https://stripe.test/checkout')
    expect(checkoutCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { order_id: 'order-123' },
      })
    )
  })

  it('returns 400 when validation fails', async () => {
    const response = await POST(createRequest({}))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('Invalid form data')
  })

  it('returns 500 when Supabase insert fails', async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: new Error('db error') })

    const response = await POST(createRequest(validPayload))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Failed to create order')
  })

  it('returns 500 when Stripe session creation throws', async () => {
    checkoutCreateMock.mockRejectedValueOnce(new Error('stripe down'))

    const response = await POST(createRequest(validPayload))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Internal server error')
  })
})

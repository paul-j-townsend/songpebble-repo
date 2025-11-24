import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/stripe-webhook/route'

const constructEventMock = vi.fn()
const selectMock = vi.fn()
const eqSelectMock = vi.fn()
const singleMock = vi.fn()
const updateMock = vi.fn()
const eqUpdateMock = vi.fn()

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: constructEventMock,
    },
  },
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: () => ({
      select: selectMock,
      update: updateMock,
    }),
  },
}))

const buildRequest = (payload: object, signature?: string) => {
  const headers = new Headers()
  if (signature) {
    headers.set('stripe-signature', signature)
  }
  return {
    text: async () => JSON.stringify(payload),
    headers,
  } as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
  selectMock.mockReturnValue({ eq: eqSelectMock })
  eqSelectMock.mockReturnValue({ single: singleMock })
  updateMock.mockReturnValue({ eq: eqUpdateMock })
  eqUpdateMock.mockResolvedValue({ error: null })

  singleMock.mockResolvedValue({
    data: { status: 'pending', stripe_session_id: 'cs_test' },
    error: null,
  })

  constructEventMock.mockImplementation((_body) => ({
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: { order_id: 'order-123' },
        payment_intent: 'pi_123',
        amount_total: 2000,
        currency: 'gbp',
      },
    },
  }))
})

describe('/api/stripe-webhook', () => {
  it('updates the order to paid when a checkout session completes', async () => {
    const response = await POST(buildRequest({ type: 'checkout.session.completed' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ received: true })
    expect(eqUpdateMock).toHaveBeenCalledWith('id', 'order-123')
  })

  it('returns 400 when the signature header is missing', async () => {
    const response = await POST(buildRequest({}, undefined))
    expect(response.status).toBe(400)
  })

  it('returns 400 when signature verification fails', async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error('bad signature')
    })

    const response = await POST(buildRequest({}))
    expect(response.status).toBe(400)
  })

  it('skips updates when the order is already paid', async () => {
    singleMock.mockResolvedValueOnce({
      data: { status: 'paid', stripe_session_id: 'cs_test' },
      error: null,
    })

    const response = await POST(buildRequest({}))
    const body = await response.json()

    expect(body).toEqual({ received: true, skipped: true })
  })

  it('returns 400 when no order_id metadata is provided', async () => {
    constructEventMock.mockImplementation(() => ({
      type: 'checkout.session.completed',
      data: { object: {} },
    }))

    const response = await POST(buildRequest({}))
    expect(response.status).toBe(400)
  })
})

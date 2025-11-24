import { describe, expect, it } from 'vitest'
import { songFormSchema, orderSchema } from '@/lib/songSchema'

const validPayload = {
  customerEmail: 'listener@example.com',
  customerName: 'Listener',
  songTitle: 'A Song About Testing',
  songStyle: 'Indie Pop',
  songMood: 'Joyful',
  lyricsInput: 'This is at least ten characters long.',
}

describe('songFormSchema', () => {
  it('accepts a fully valid payload', () => {
    const parsed = songFormSchema.safeParse(validPayload)
    expect(parsed.success).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      customerEmail: 'not-an-email',
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.customerEmail).toContain(
        'Please enter a valid email address'
      )
    }
  })

  it('requires lyrics to meet the minimum length', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      lyricsInput: 'short',
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.lyricsInput).toContain(
        'Lyrics must be at least 10 characters'
      )
    }
  })
})

describe('orderSchema', () => {
  const baseOrder = {
    id: '00000000-0000-0000-0000-000000000000',
    customer_email: 'listener@example.com',
    customer_name: 'Listener',
    song_title: 'My Track',
    song_style: 'Pop',
    song_mood: 'Calm',
    lyrics_input: 'Some lyrics',
    stripe_session_id: 'cs_test_123',
    stripe_payment_intent_id: 'pi_test_123',
    amount_paid: 2000,
    currency: 'gbp',
    status: 'paid' as const,
    mp3_url: null,
    wav_url: null,
    lyrics_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    paid_at: new Date().toISOString(),
    delivered_at: null,
  }

  it('accepts persisted order payloads', () => {
    expect(orderSchema.safeParse(baseOrder).success).toBe(true)
  })

  it('rejects unsupported currencies', () => {
    const parsed = orderSchema.safeParse({
      ...baseOrder,
      currency: 'aud',
    })

    expect(parsed.success).toBe(false)
  })
})

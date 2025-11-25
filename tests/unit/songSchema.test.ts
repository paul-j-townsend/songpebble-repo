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

  it('accepts valid characters array', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterName: 'Alice',
          characterGender: 'female' as const,
          characterInterests: 'painting, music, hiking',
          characterMention: 'always wears colorful socks',
        },
        {
          characterName: 'Bob',
          characterGender: 'male' as const,
          characterInterests: 'coding, gaming',
          characterMention: 'loves coffee',
        },
      ],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts empty characters array', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts payload without characters field', () => {
    const parsed = songFormSchema.safeParse(validPayload)
    expect(parsed.success).toBe(true)
  })

  it('accepts characters with only required name field', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterName: 'Charlie',
        },
      ],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts all valid gender options', () => {
    const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other']

    genders.forEach((gender) => {
      const parsed = songFormSchema.safeParse({
        ...validPayload,
        characters: [
          {
            characterName: 'Test Character',
            characterGender: gender,
          },
        ],
      })
      expect(parsed.success).toBe(true)
    })
  })

  it('rejects character with missing name', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterGender: 'female' as const,
          characterInterests: 'reading',
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects character with empty name', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterName: '',
          characterGender: 'male' as const,
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects character name that is too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterName: 'a'.repeat(101), // 101 characters
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects character interests that are too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterName: 'David',
          characterInterests: 'a'.repeat(501), // 501 characters
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects character mention that is too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: [
        {
          characterName: 'Eve',
          characterMention: 'a'.repeat(501), // 501 characters
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects more than 8 characters', () => {
    const nineCharacters = Array.from({ length: 9 }, (_, i) => ({
      characterName: `Character ${i + 1}`,
    }))

    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: nineCharacters,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.characters).toContain(
        'Maximum 8 characters allowed'
      )
    }
  })

  it('accepts exactly 8 characters', () => {
    const eightCharacters = Array.from({ length: 8 }, (_, i) => {
      const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other']
      return {
        characterName: `Character ${i + 1}`,
        characterGender: genders[i % 3],
      }
    })

    const parsed = songFormSchema.safeParse({
      ...validPayload,
      characters: eightCharacters,
    })
    expect(parsed.success).toBe(true)
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

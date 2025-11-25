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

  // To Characters (Recipients) Tests
  it('accepts valid toCharacters array', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
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

  it('accepts empty toCharacters array', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts payload without toCharacters field', () => {
    const parsed = songFormSchema.safeParse(validPayload)
    expect(parsed.success).toBe(true)
  })

  it('accepts toCharacters with only required name field', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        {
          characterName: 'Charlie',
        },
      ],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts all valid gender options for toCharacters', () => {
    const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other']

    genders.forEach((gender) => {
      const parsed = songFormSchema.safeParse({
        ...validPayload,
        toCharacters: [
          {
            characterName: 'Test Character',
            characterGender: gender,
          },
        ],
      })
      expect(parsed.success).toBe(true)
    })
  })

  it('rejects toCharacter with missing name', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        {
          characterGender: 'female' as const,
          characterInterests: 'reading',
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects toCharacter with empty name', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        {
          characterName: '',
          characterGender: 'male' as const,
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects toCharacter name that is too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        {
          characterName: 'a'.repeat(101), // 101 characters
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects toCharacter interests that are too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        {
          characterName: 'David',
          characterInterests: 'a'.repeat(501), // 501 characters
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects toCharacter mention that is too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        {
          characterName: 'Eve',
          characterMention: 'a'.repeat(501), // 501 characters
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects more than 8 toCharacters', () => {
    const nineCharacters = Array.from({ length: 9 }, (_, i) => ({
      characterName: `Character ${i + 1}`,
    }))

    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: nineCharacters,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.toCharacters).toContain(
        'Maximum 8 recipients allowed'
      )
    }
  })

  it('accepts exactly 8 toCharacters', () => {
    const eightCharacters = Array.from({ length: 8 }, (_, i) => {
      const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other']
      return {
        characterName: `Character ${i + 1}`,
        characterGender: genders[i % 3],
      }
    })

    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: eightCharacters,
    })
    expect(parsed.success).toBe(true)
  })

  // Senders Tests
  it('accepts valid senders array', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: [
        { senderName: 'Mom and Dad' },
        { senderName: 'Grandma' },
      ],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts empty senders array', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: [],
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts payload without senders field', () => {
    const parsed = songFormSchema.safeParse(validPayload)
    expect(parsed.success).toBe(true)
  })

  it('rejects sender with missing name', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: [{}],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects sender with empty name', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: [{ senderName: '' }],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects sender name that is too long', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: [{ senderName: 'a'.repeat(101) }],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects more than 8 senders', () => {
    const nineSenders = Array.from({ length: 9 }, (_, i) => ({
      senderName: `Sender ${i + 1}`,
    }))

    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: nineSenders,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.senders).toContain(
        'Maximum 8 senders allowed'
      )
    }
  })

  it('accepts exactly 8 senders', () => {
    const eightSenders = Array.from({ length: 8 }, (_, i) => ({
      senderName: `Sender ${i + 1}`,
    }))

    const parsed = songFormSchema.safeParse({
      ...validPayload,
      senders: eightSenders,
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts both toCharacters and senders together', () => {
    const parsed = songFormSchema.safeParse({
      ...validPayload,
      toCharacters: [
        { characterName: 'Alice', characterGender: 'female' as const },
      ],
      senders: [
        { senderName: 'Bob' },
      ],
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

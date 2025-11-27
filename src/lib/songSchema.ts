import { z } from 'zod'

/**
 * Zod schema for song form validation
 * Validates customer input before creating an order
 */
export const songFormSchema = z.object({
  // Customer information
  customerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  customerName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),

  occasion: z.enum(['christmas', 'birthday', 'leaving-gift', 'roast', 'pets', 'kids']).default('christmas'),

  // Tone selection (optional)
  tone: z.enum(['funny', 'sweet', 'epic', 'rude', 'emotional']).optional(),

  // Song details
  songTitle: z
    .string()
    .min(1, 'Song title is required')
    .max(100, 'Song title must be less than 100 characters'),

  songStyle: z
    .string()
    .min(1, 'Song style is required')
    .max(100, 'Song style must be less than 100 characters'),

  songMood: z
    .string()
    .max(100, 'Song mood must be less than 100 characters')
    .optional(),

  // Suno AI parameters
  vocalGender: z
    .enum(['male', 'female', 'mixed', 'instrumental', ''])
    .optional(),

  tempo: z
    .enum(['slow', 'medium', 'fast', 'very-fast', ''])
    .optional(),

  instruments: z
    .array(z.enum([
      'guitar',
      'piano',
      'synth',
      'drums',
      'strings',
      'brass',
      'bass',
      'electronic',
      'orchestral',
      'vocals-only'
    ]))
    .optional(),

  lyricsInput: z
    .string()
    .refine(
      (val) => {
        // Allow empty strings (will use generated prompt)
        if (!val || val.trim().length === 0) return true
        // If provided, must be at least 10 characters
        return val.trim().length >= 10
      },
      { message: 'Lyrics must be at least 10 characters if provided' }
    )
    .refine(
      (val) => !val || val.length <= 2000,
      { message: 'Lyrics must be less than 2000 characters' }
    )
    .default(''),

  // To Characters (1-8 recipients with full details)
  toCharacters: z
    .array(
      z.object({
        characterName: z
          .string()
          .min(1, 'Character name is required')
          .max(100, 'Character name must be less than 100 characters'),
        characterGender: z
          .enum(['male', 'female', 'other'])
          .optional(),
        characterInterests: z
          .string()
          .max(500, 'Character interests must be less than 500 characters')
          .optional(),
        characterMention: z
          .string()
          .max(500, 'Character mention must be less than 500 characters')
          .optional(),
      })
    )
    .min(1, 'At least one recipient is required')
    .max(8, 'Maximum 8 recipients allowed')
    .default([]),

  // Senders (0-1 sender with just name)
  senders: z
    .array(
      z.object({
        senderName: z
          .string()
          .min(1, 'Sender name is required')
          .max(100, 'Sender name must be less than 100 characters'),
      })
    )
    .min(0, 'Invalid senders')
    .max(1, 'Maximum 1 sender allowed')
    .default([]),
})
  .refine((data) => {
    // Birthday and leaving-gift must have exactly 1 character
    if (data.occasion === 'birthday' || data.occasion === 'leaving-gift') {
      return data.toCharacters.length === 1
    }
    return true
  }, {
    message: 'Birthday and Leaving Gift songs must have exactly 1 recipient',
    path: ['toCharacters'],
  })
  .refine((data) => {
    // Christmas and roast: max 6 characters
    if (data.occasion === 'christmas' || data.occasion === 'roast') {
      return data.toCharacters.length <= 6
    }
    // Pets and kids: max 4 characters
    if (data.occasion === 'pets' || data.occasion === 'kids') {
      return data.toCharacters.length <= 4
    }
    return true
  }, (data) => {
    const occasion = data.occasion
    if (occasion === 'christmas' || occasion === 'roast') {
      return {
        message: `${occasion === 'christmas' ? 'Christmas' : 'Roast'} songs can have maximum 6 recipients`,
        path: ['toCharacters'],
      }
    }
    if (occasion === 'pets' || occasion === 'kids') {
      return {
        message: `${occasion === 'pets' ? 'Pets' : 'Kids'} songs can have maximum 4 recipients`,
        path: ['toCharacters'],
      }
    }
    return { message: 'Invalid number of recipients', path: ['toCharacters'] }
  })

// Export the inferred TypeScript type
export type SongFormData = z.infer<typeof songFormSchema>

// Export types for convenience
export type ToCharacter = {
  characterName: string
  characterGender?: 'male' | 'female' | 'other'
  characterInterests?: string
  characterMention?: string
}

export type Sender = {
  senderName: string
}

export type LyricProvider = 'claude' | 'template'

/**
 * Order data schema (what gets stored in database)
 * This matches the database schema from supabase/01_create_orders_table.sql
 */
export const orderSchema = z.object({
  id: z.string().uuid(),
  customer_email: z.string().email(),
  customer_name: z.string().nullable().optional(),
  occasion: z.enum(['christmas', 'birthday', 'leaving-gift', 'roast', 'pets', 'kids']),
  tone: z.enum(['funny', 'sweet', 'epic', 'rude', 'emotional']).nullable().optional(),
  song_title: z.string(),
  song_style: z.string(),
  song_mood: z.string().nullable().optional(),
  vocal_gender: z.enum(['male', 'female', 'mixed', 'instrumental']).nullable().optional(),
  tempo: z.enum(['slow', 'medium', 'fast', 'very-fast']).nullable().optional(),
  instruments: z.union([z.array(z.string()), z.string()]).nullable().optional(),
  lyrics_input: z.string(),
  stripe_session_id: z.string().nullable().optional(),
  stripe_payment_intent_id: z.string().nullable().optional(),
  amount_paid: z.number().int().positive().nullable().optional(),
  currency: z.enum(['gbp', 'usd', 'eur']).default('gbp'),
  status: z.enum(['pending', 'paid', 'processing', 'delivered', 'failed']),
  mp3_url: z.string().nullable().optional(),
  wav_url: z.string().nullable().optional(),
  lyrics_url: z.string().nullable().optional(),
  lyric_provider: z.enum(['claude', 'template']).nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  paid_at: z.string().datetime().nullable().optional(),
  delivered_at: z.string().datetime().nullable().optional(),
})

export type Order = z.infer<typeof orderSchema>

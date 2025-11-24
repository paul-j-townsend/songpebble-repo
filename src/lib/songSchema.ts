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

  lyricsInput: z
    .string()
    .min(10, 'Lyrics must be at least 10 characters')
    .max(2000, 'Lyrics must be less than 2000 characters'),
})

// Export the inferred TypeScript type
export type SongFormData = z.infer<typeof songFormSchema>

/**
 * Order data schema (what gets stored in database)
 * This matches the database schema from supabase/01_create_orders_table.sql
 */
export const orderSchema = z.object({
  id: z.string().uuid(),
  customer_email: z.string().email(),
  customer_name: z.string().optional(),
  song_title: z.string(),
  song_style: z.string(),
  song_mood: z.string().optional(),
  lyrics_input: z.string(),
  stripe_session_id: z.string().optional(),
  stripe_payment_intent_id: z.string().optional(),
  amount_paid: z.number().int().positive().optional(),
  currency: z.enum(['gbp', 'usd', 'eur']).default('gbp'),
  status: z.enum(['pending', 'paid', 'processing', 'delivered', 'failed']),
  mp3_url: z.string().optional(),
  wav_url: z.string().optional(),
  lyrics_url: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  paid_at: z.string().datetime().optional(),
  delivered_at: z.string().datetime().optional(),
})

export type Order = z.infer<typeof orderSchema>

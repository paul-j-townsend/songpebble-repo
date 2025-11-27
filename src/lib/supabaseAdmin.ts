import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client (Server-side only)
 *
 * IMPORTANT: This client uses the service role key which bypasses Row Level Security (RLS).
 * Only use this in API routes and server-side code. NEVER expose this to the client.
 *
 * The service role key gives full access to the database, bypassing all RLS policies.
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Helper type for database tables
 * Extend this as needed when you add more tables
 */
export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_email: string
          customer_name: string | null
          occasion: 'christmas' | 'birthday' | 'leaving-gift' | 'roast' | 'pets' | 'kids'
          tone: 'funny' | 'sweet' | 'epic' | 'rude' | 'emotional' | null
          song_title: string
          song_style: string
          song_mood: string | null
          vocal_gender: 'male' | 'female' | 'mixed' | 'instrumental' | null
          tempo: 'slow' | 'medium' | 'fast' | 'very-fast' | null
          instruments: string[] | null
          lyrics_input: string
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          amount_paid: number | null
          currency: 'gbp' | 'usd' | 'eur'
          status: 'pending' | 'paid' | 'processing' | 'delivered' | 'failed'
          mp3_url: string | null
          wav_url: string | null
          lyrics_url: string | null
          lyric_provider: 'claude' | 'template' | null
          created_at: string
          updated_at: string
          paid_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          customer_email: string
          customer_name?: string | null
          occasion: 'christmas' | 'birthday' | 'leaving-gift' | 'roast' | 'pets' | 'kids'
          tone?: 'funny' | 'sweet' | 'epic' | 'rude' | 'emotional' | null
          song_title: string
          song_style: string
          song_mood?: string | null
          vocal_gender?: 'male' | 'female' | 'mixed' | 'instrumental' | null
          tempo?: 'slow' | 'medium' | 'fast' | 'very-fast' | null
          instruments?: string[] | null
          lyrics_input: string
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_paid?: number | null
          currency?: 'gbp' | 'usd' | 'eur'
          status?: 'pending' | 'paid' | 'processing' | 'delivered' | 'failed'
          mp3_url?: string | null
          wav_url?: string | null
          lyrics_url?: string | null
          lyric_provider?: 'claude' | 'template' | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          customer_email?: string
          customer_name?: string | null
          occasion?: 'christmas' | 'birthday' | 'leaving-gift' | 'roast' | 'pets' | 'kids'
          tone?: 'funny' | 'sweet' | 'epic' | 'rude' | 'emotional' | null
          song_title?: string
          song_style?: string
          song_mood?: string | null
          vocal_gender?: 'male' | 'female' | 'mixed' | 'instrumental' | null
          tempo?: 'slow' | 'medium' | 'fast' | 'very-fast' | null
          instruments?: string[] | null
          lyrics_input?: string
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_paid?: number | null
          currency?: 'gbp' | 'usd' | 'eur'
          status?: 'pending' | 'paid' | 'processing' | 'delivered' | 'failed'
          mp3_url?: string | null
          wav_url?: string | null
          lyrics_url?: string | null
          lyric_provider?: 'claude' | 'template' | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          delivered_at?: string | null
        }
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          recipient_email: string
          email_provider: 'postmark' | 'resend' | null
          email_provider_id: string | null
          status: 'sent' | 'delivered' | 'bounced' | 'failed'
          error_message: string | null
          retry_count: number
          created_at: string
          updated_at: string
          delivered_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          recipient_email: string
          email_provider?: 'postmark' | 'resend' | null
          email_provider_id?: string | null
          status?: 'sent' | 'delivered' | 'bounced' | 'failed'
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
          delivered_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          recipient_email?: string
          email_provider?: 'postmark' | 'resend' | null
          email_provider_id?: string | null
          status?: 'sent' | 'delivered' | 'bounced' | 'failed'
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
          delivered_at?: string | null
        }
      }
    }
  }
}

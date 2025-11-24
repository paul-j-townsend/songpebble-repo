/**
 * Environment variable validation
 * This ensures all required environment variables are present and valid
 */

export function validateEnv() {
  const requiredEnvVars = {
    // Supabase (public and private)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Stripe (private)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,

    // Application
    BASE_URL: process.env.BASE_URL,
  }

  const missing: string[] = []
  const invalid: string[] = []

  // Check for missing variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    }
  }

  // Validate URL format for Supabase URL
  if (requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL)
      if (!url.protocol.startsWith('http')) {
        invalid.push('NEXT_PUBLIC_SUPABASE_URL (must be a valid HTTP/HTTPS URL)')
      }
    } catch {
      invalid.push('NEXT_PUBLIC_SUPABASE_URL (invalid URL format)')
    }
  }

  // Validate BASE_URL format
  if (requiredEnvVars.BASE_URL) {
    try {
      const url = new URL(requiredEnvVars.BASE_URL)
      if (!url.protocol.startsWith('http')) {
        invalid.push('BASE_URL (must be a valid HTTP/HTTPS URL)')
      }
    } catch {
      invalid.push('BASE_URL (invalid URL format)')
    }
  }

  // Report errors
  if (missing.length > 0 || invalid.length > 0) {
    const errors: string[] = []

    if (missing.length > 0) {
      errors.push(`Missing required environment variables:\n  - ${missing.join('\n  - ')}`)
    }

    if (invalid.length > 0) {
      errors.push(`Invalid environment variables:\n  - ${invalid.join('\n  - ')}`)
    }

    throw new Error(
      `Environment validation failed:\n\n${errors.join('\n\n')}\n\nPlease check your .env.local file.`
    )
  }

  return true
}

// Optional: Check for email provider (one is required)
export function validateEmailProvider() {
  const postmarkKey = process.env.POSTMARK_API_KEY
  const resendKey = process.env.RESEND_API_KEY

  if (!postmarkKey && !resendKey) {
    throw new Error(
      'Email provider validation failed:\n\n' +
      'At least one email provider API key is required:\n' +
      '  - POSTMARK_API_KEY\n' +
      '  - RESEND_API_KEY\n\n' +
      'Please add one to your .env.local file.'
    )
  }

  return true
}

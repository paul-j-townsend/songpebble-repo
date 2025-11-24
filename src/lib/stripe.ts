import Stripe from 'stripe'

/**
 * Stripe Client (Server-side only)
 *
 * IMPORTANT: Only use this in API routes and server-side code.
 * Never expose the Stripe secret key to the client.
 */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing environment variable: STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

/**
 * Get the Stripe Price ID from environment
 */
export function getStripePriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    throw new Error('Missing environment variable: STRIPE_PRICE_ID')
  }
  return priceId
}

/**
 * Get the base URL for redirects
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.BASE_URL
  if (!baseUrl) {
    throw new Error('Missing environment variable: BASE_URL')
  }
  return baseUrl
}

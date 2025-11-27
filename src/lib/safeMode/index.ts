import { Occasion, Tone, SafeModeParams, enforceCharacterLimit } from './types'
import { generateChristmasPrompt } from './christmas'
import { generateBirthdayPrompt } from './birthday'
import { generateLeavingGiftPrompt } from './leavingGift'
import { generateRoastPrompt } from './roast'
import { generatePetsPrompt } from './pets'
import { generateKidsPrompt } from './kids'

/**
 * Main Safe Mode prompt generator
 * Routes to occasion-specific generators and enforces global constraints
 *
 * Global constraints enforced:
 * - No emojis, parentheses, special characters
 * - No brackets except section headers
 * - No slang or complex metaphors
 * - Simple, clean, easy to sing language
 * - International English (no Americanisms)
 * - Avoid archaic/formal words
 * - Max 2500 characters total
 *
 * @param occasion - The type of song (christmas, birthday, etc.)
 * @param params - Character data, senders, and optional tone
 * @returns Generated lyrics string
 */
export function generateSafeModePrompt(
  occasion: Occasion,
  params: SafeModeParams
): string {
  let lyrics: string

  // Route to occasion-specific generator
  switch (occasion) {
    case 'christmas':
      lyrics = generateChristmasPrompt(params)
      break
    case 'birthday':
      lyrics = generateBirthdayPrompt(params)
      break
    case 'leaving-gift':
      lyrics = generateLeavingGiftPrompt(params)
      break
    case 'roast':
      lyrics = generateRoastPrompt(params)
      break
    case 'pets':
      lyrics = generatePetsPrompt(params)
      break
    case 'kids':
      lyrics = generateKidsPrompt(params)
      break
    default:
      throw new Error(`Unknown occasion: ${occasion}`)
  }

  // Apply tone modifications if specified
  if (params.tone) {
    lyrics = applyToneModifications(lyrics, params.tone)
  }

  // Enforce character limit (2500 chars)
  lyrics = enforceCharacterLimit(lyrics, 2500)

  // Final validation: ensure no forbidden patterns
  lyrics = cleanLyrics(lyrics)

  return lyrics
}

/**
 * Apply tone-specific modifications to lyrics
 * Note: Most tone is applied during generation, this is for final adjustments
 */
function applyToneModifications(lyrics: string, tone: Tone): string {
  // For now, tone is primarily applied through the generation process
  // Future: could add tone-specific word replacements or emphasis
  return lyrics
}

/**
 * Clean lyrics to ensure Safe Mode compliance
 * Removes or replaces forbidden patterns
 */
export function cleanLyrics(lyrics: string): string {
  let cleaned = lyrics

  // Remove emojis (basic emoji range) - using string character codes instead of unicode property escapes
  cleaned = cleaned.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Surrogate pairs (most emojis)
  cleaned = cleaned.replace(/[\u2600-\u27BF]/g, '') // Misc symbols and dingbats

  // Remove parentheses and their contents
  cleaned = cleaned.replace(/\([^)]*\)/g, '')

  // Remove special characters (keep only letters, numbers, spaces, punctuation, newlines, brackets for sections)
  // Allow: a-z A-Z 0-9 space , . ! ? ' - : newline and []
  cleaned = cleaned.replace(/[^\w\s,.!?'\-:\n\[\]]/g, '')

  // Replace forbidden archaic/formal words with simpler alternatives
  const forbiddenWords: Record<string, string> = {
    'kin': 'family',
    'folk': 'people',
    'thee': 'you',
    'thy': 'your',
    'beloved': 'loved',
    'cherished': 'loved',
    'brethren': 'friends',
    'jubilation': 'joy',
    'farewell': 'goodbye',
    'endeavor': 'try',
    'alas': '',
    'behold': 'see',
    'whilst': 'while',
    'companion': 'friend',
    'festive': 'joyful',
    'rejoice': 'celebrate',
    'glory': 'joy',
    'splendor': 'beauty',
    'hearth': 'home',
    'abode': 'home',
    'dandy': 'great',
    'fine': 'great',
    'grand': 'great',
  }

  // Replace forbidden words (case-insensitive)
  Object.entries(forbiddenWords).forEach(([forbidden, replacement]) => {
    const regex = new RegExp(`\\b${forbidden}\\b`, 'gi')
    cleaned = cleaned.replace(regex, replacement)
  })

  // Replace Americanisms with British English
  const americanisms: Record<string, string> = {
    'candy': 'sweets',
    'sidewalk': 'pavement',
    'truck': 'lorry',
    'vacation': 'holiday',
    'apartment': 'flat',
    'elevator': 'lift',
    'mom': 'mum',
    'diaper': 'nappy',
    'cookie': 'biscuit',
    'trash': 'rubbish',
    'soccer': 'football',
  }

  Object.entries(americanisms).forEach(([american, british]) => {
    const regex = new RegExp(`\\b${american}\\b`, 'gi')
    cleaned = cleaned.replace(regex, british)
  })

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
  cleaned = cleaned.replace(/ {2,}/g, ' ') // Max 1 space
  cleaned = cleaned.trim()

  return cleaned
}

// Re-export types and utilities for convenience
export * from './types'

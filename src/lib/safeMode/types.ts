import { ToCharacter, Sender } from '../songSchema'

/**
 * Safe Mode types for occasion-specific prompt generation
 */

export type Occasion = 'christmas' | 'birthday' | 'leaving-gift' | 'roast' | 'pets' | 'kids'
export type Tone = 'funny' | 'sweet' | 'epic' | 'rude' | 'emotional'

/**
 * Parameters for generating Safe Mode prompts
 */
export interface SafeModeParams {
  toCharacters: ToCharacter[]
  senders: Sender[]
  tone?: Tone
}

/**
 * Helper function to format an array of names with proper grammar
 * - 1 name: "Alice"
 * - 2 names: "Alice and Bob"
 * - 3+ names: "Alice, Bob and Charlie"
 */
export function formatNameList(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`

  const allButLast = names.slice(0, -1).join(', ')
  const last = names[names.length - 1]
  return `${allButLast} and ${last}`
}

/**
 * Get pronoun based on gender
 */
export function getPronoun(gender?: 'male' | 'female' | 'other', type: 'subject' | 'object' = 'subject'): string {
  if (!gender || gender === 'other') {
    return type === 'subject' ? 'they' : 'them'
  }
  if (gender === 'male') {
    return type === 'subject' ? 'he' : 'him'
  }
  return type === 'subject' ? 'she' : 'her'
}

/**
 * Apply tone modifications to a text
 */
export function applyTone(text: string, tone?: Tone): string {
  // For now, tone doesn't modify the text directly
  // The tone is applied through the choice of words in each generator
  return text
}

/**
 * Enforce character limit
 */
export function enforceCharacterLimit(text: string, maxChars: number = 2500): string {
  if (text.length <= maxChars) return text

  // Truncate at the last complete line before the limit
  const truncated = text.slice(0, maxChars)
  const lastNewline = truncated.lastIndexOf('\n')

  if (lastNewline > 0) {
    return truncated.slice(0, lastNewline)
  }

  return truncated
}

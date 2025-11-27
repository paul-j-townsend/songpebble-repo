import { cleanLyrics } from './safeMode'

/**
 * Validation results for generated lyrics
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  cleanedLyrics: string
  stats: {
    characterCount: number
    lineCount: number
    sections: string[]
  }
}

/**
 * Validate generated lyrics against Safe Mode constraints
 */
export function validateLyrics(
  lyrics: string,
  occasion: string,
  characterCount: number
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Clean lyrics first
  const cleanedLyrics = cleanLyrics(lyrics)

  // Check character count
  if (cleanedLyrics.length > 2500) {
    errors.push(`Exceeds 2500 character limit (${cleanedLyrics.length} characters)`)
  }

  if (cleanedLyrics.length < 100) {
    errors.push(`Too short (${cleanedLyrics.length} characters, minimum 100)`)
  }

  // Check for required sections
  const hasIntro = /\[INTRO[:\]]/i.test(cleanedLyrics)
  const hasVerse = /\[VERSE[:\]]/i.test(cleanedLyrics)
  const hasChorus = /\[CHORUS[:\]]/i.test(cleanedLyrics)
  const hasOutro = /\[OUTRO[:\]]/i.test(cleanedLyrics)

  if (!hasIntro) errors.push('Missing [INTRO] section')
  if (!hasVerse) errors.push('Missing [VERSE] section')
  if (!hasChorus) errors.push('Missing [CHORUS] section')
  if (!hasOutro) errors.push('Missing [OUTRO] section')

  // Extract sections
  const sections: string[] = []
  const sectionMatches = cleanedLyrics.matchAll(/\[([A-Z]+)[:\]]/g)
  for (const match of sectionMatches) {
    sections.push(match[1])
  }

  // Validate occasion-specific rules
  validateOccasionRules(cleanedLyrics, occasion, characterCount, errors, warnings)

  // Check for forbidden patterns
  if (/[\u{1F600}-\u{1F64F}]/gu.test(cleanedLyrics)) {
    warnings.push('Contains emojis (should be removed by cleaning)')
  }
  if (/\([^)]*\)/.test(cleanedLyrics)) {
    warnings.push('Contains parentheses (should be removed by cleaning)')
  }

  // Count lines
  const lines = cleanedLyrics.split('\n').filter(l => l.trim().length > 0)
  const lineCount = lines.length

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanedLyrics,
    stats: {
      characterCount: cleanedLyrics.length,
      lineCount,
      sections,
    },
  }
}

/**
 * Validate occasion-specific rules
 */
function validateOccasionRules(
  lyrics: string,
  occasion: string,
  characterCount: number,
  errors: string[],
  warnings: string[]
): void {
  const lyricsLower = lyrics.toLowerCase()

  switch (occasion) {
    case 'christmas':
      // Should contain "Merry Christmas and a happy new year"
      if (!lyricsLower.includes('merry christmas') && !lyricsLower.includes('happy new year')) {
        warnings.push('Christmas song should mention "Merry Christmas and a happy new year"')
      }
      // Max 6 characters
      if (characterCount > 6) {
        errors.push(`Christmas songs support max 6 recipients (got ${characterCount})`)
      }
      break

    case 'birthday':
    case 'leaving-gift':
      // Must have exactly 1 character
      if (characterCount !== 1) {
        errors.push(`${occasion} songs must have exactly 1 recipient (got ${characterCount})`)
      }
      // Name should appear at least 3 times (hard to validate without knowing the name)
      const verseCount = (lyrics.match(/\[VERSE/gi) || []).length
      if (verseCount > 1) {
        warnings.push(`${occasion} songs typically have only 1 verse`)
      }
      break

    case 'roast':
      // Max 6 characters
      if (characterCount > 6) {
        errors.push(`Roast songs support max 6 recipients (got ${characterCount})`)
      }
      break

    case 'pets':
    case 'kids':
      // Max 4 characters
      if (characterCount > 4) {
        errors.push(`${occasion} songs support max 4 recipients (got ${characterCount})`)
      }
      break
  }
}

/**
 * Quick validation check (returns boolean only)
 */
export function isValidLyrics(
  lyrics: string,
  occasion: string,
  characterCount: number
): boolean {
  const result = validateLyrics(lyrics, occasion, characterCount)
  return result.valid
}

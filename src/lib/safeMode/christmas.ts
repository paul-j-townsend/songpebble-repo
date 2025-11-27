import { SafeModeParams, formatNameList, getPronoun } from './types'

/**
 * Generate Christmas song lyrics following Safe Mode rules
 *
 * Structure:
 * - [Music: 110 BPM, folk rock, acoustic guitar, bells, warm harmonies]
 * - [INTRO: bells ringing] (2-3 lines)
 * - One [VERSE] per character (max 6, max 4 lines each)
 * - [CHORUS: cheering, group vocals] (4-5 lines)
 * - [OUTRO: bells ringing, soft] (2-3 lines)
 *
 * Constraints:
 * - Mention Christmas, warmth, bells, snow
 * - One verse per character
 * - End outro with "Merry Christmas and a happy new year"
 * - Include fromNames in outro
 * - Max 2500 characters total
 */
export function generateChristmasPrompt(params: SafeModeParams): string {
  const { toCharacters, senders } = params

  // Get character names for intro/outro
  const characterNames = toCharacters.map(c => c.characterName)
  const allCharacterNames = formatNameList(characterNames)

  // Get sender names
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames)

  const lines: string[] = []

  // Music tag
  lines.push('[Music: 110 BPM, folk rock, acoustic guitar, bells, warm harmonies]')
  lines.push('')

  // INTRO (2-3 lines)
  lines.push('[INTRO: bells ringing]')
  lines.push('The snow is falling soft and bright')
  lines.push(`A Christmas song for ${allCharacterNames}`)
  lines.push('Together here on this winter night')
  lines.push('')

  // VERSES - one per character (max 6)
  const verseDescriptors = ['upbeat', 'cheerful', 'joyful', 'warm', 'bright', 'happy']
  toCharacters.slice(0, 6).forEach((char, index) => {
    const descriptor = verseDescriptors[index] || 'warm'
    const pronoun = getPronoun(char.characterGender, 'subject')

    lines.push(`[VERSE ${index + 1}: ${descriptor}]`)
    lines.push(`${char.characterName} brings the Christmas cheer`)

    if (char.characterInterests) {
      // Use first interest only, keep it simple
      const firstInterest = char.characterInterests.split(',')[0].trim()
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} loves ${firstInterest} all year round`)
    } else {
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} makes everything feel right`)
    }

    if (char.characterMention) {
      // Keep mention short and simple
      const mention = char.characterMention.split('.')[0].trim()
      lines.push(mention)
    } else {
      lines.push('The warmth and joy are always here')
    }

    lines.push(`This Christmas time we hold ${pronoun} dear`)
    lines.push('')
  })

  // CHORUS (4-5 lines)
  lines.push('[CHORUS: cheering, group vocals]')
  lines.push('Ring the bells and sing along')
  lines.push('This Christmas day we all belong')
  lines.push('With laughter warm and spirits high')
  lines.push('Under the winter sky')
  lines.push('')

  // OUTRO (2-3 lines with "Merry Christmas and a happy new year")
  lines.push('[OUTRO: bells ringing, soft]')
  lines.push(`To ${allCharacterNames}`)
  if (fromNames) {
    lines.push(`With love from ${fromNames}`)
  }
  lines.push('Merry Christmas and a happy new year')

  return lines.join('\n')
}

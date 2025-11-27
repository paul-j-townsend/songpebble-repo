import { SafeModeParams, formatNameList, getPronoun } from './types'

/**
 * Generate Pets song lyrics following Safe Mode rules
 *
 * Structure:
 * - [Music: 105 BPM, indie pop, ukulele, playful, light harmonies]
 * - [INTRO: playful, cute] (2-3 lines)
 * - One [VERSE] per pet (max 4, max 4 lines each)
 * - [CHORUS: sweet, warm] (4-5 lines)
 * - [OUTRO: gentle, hum] (2-3 lines)
 *
 * Constraints:
 * - Describe pet behaviour cutely
 * - One verse per pet (max 4)
 * - Include fromNames in outro
 * - Max 2500 characters total
 */
export function generatePetsPrompt(params: SafeModeParams): string {
  const { toCharacters, senders } = params

  // Get pet names for intro/outro
  const petNames = toCharacters.map(c => c.characterName)
  const allPetNames = formatNameList(petNames)

  // Get sender names
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames)

  const lines: string[] = []

  // Music tag
  lines.push('[Music: 105 BPM, indie pop, ukulele, playful, light harmonies]')
  lines.push('')

  // INTRO (2-3 lines)
  lines.push('[INTRO: playful, cute]')
  lines.push(`This song is for ${allPetNames}`)
  lines.push('Our furry friends who bring us joy')
  lines.push('With wagging tails and gentle paws')
  lines.push('')

  // VERSES - one per pet (max 4)
  const verseDescriptors = ['cute, sweet voice', 'adorable', 'playful', 'sweet']
  toCharacters.slice(0, 4).forEach((pet, index) => {
    const descriptor = verseDescriptors[index] || 'sweet'
    const pronoun = getPronoun(pet.characterGender, 'subject')

    lines.push(`[VERSE ${index + 1}: ${descriptor}]`)
    lines.push(`${pet.characterName} is such a delight`)

    if (pet.characterInterests) {
      const firstInterest = pet.characterInterests.split(',')[0].trim()
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} loves to ${firstInterest}`)
    } else {
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} fills our days with love`)
    }

    if (pet.characterMention) {
      const mention = pet.characterMention.split('.')[0].trim()
      lines.push(mention)
    } else {
      lines.push('Every moment brings us closer still')
    }

    lines.push(`${pet.characterName} makes everything right`)
    lines.push('')
  })

  // CHORUS (4-5 lines)
  lines.push('[CHORUS: sweet, warm]')
  lines.push('Our pets bring sunshine to each day')
  lines.push('With every cuddle and every play')
  lines.push('They teach us how to love and care')
  lines.push('Our special friends beyond compare')
  lines.push('')

  // OUTRO (2-3 lines)
  lines.push('[OUTRO: gentle, hum]')
  lines.push(`To ${allPetNames} with all our love`)
  if (fromNames) {
    lines.push(`From ${fromNames} who care so much`)
  }
  lines.push('You bring us joy with every touch')

  return lines.join('\n')
}

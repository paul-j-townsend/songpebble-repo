import { SafeModeParams, formatNameList, getPronoun } from './types'

/**
 * Generate Roast song lyrics following Safe Mode rules
 *
 * Structure:
 * - [Music: 125 BPM, rock, electric guitar, playful energy]
 * - [INTRO: playful] (2-3 lines)
 * - One [VERSE] per character (max 6, max 4 lines each)
 * - [CHORUS: laughing, group vocals] (4-5 lines)
 * - [OUTRO: friendly, laugh] (2-3 lines)
 *
 * Constraints:
 * - Simple, light teasing only (safe words)
 * - One verse per character (max 6)
 * - Include fromNames in outro
 * - Max 2500 characters total
 */
export function generateRoastPrompt(params: SafeModeParams): string {
  const { toCharacters, senders } = params

  // Get character names for intro/outro
  const characterNames = toCharacters.map(c => c.characterName)
  const allCharacterNames = formatNameList(characterNames)

  // Get sender names
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames)

  const lines: string[] = []

  // Music tag
  lines.push('[Music: 125 BPM, rock, electric guitar, playful energy]')
  lines.push('')

  // INTRO (2-3 lines)
  lines.push('[INTRO: playful]')
  lines.push('Get ready for some fun today')
  lines.push(`We're here to roast ${allCharacterNames} in a friendly way`)
  lines.push('All in good fun with love to share')
  lines.push('')

  // VERSES - one per character (max 6)
  const verseDescriptors = ['cheeky', 'teasing', 'playful', 'silly', 'light', 'funny']
  toCharacters.slice(0, 6).forEach((char, index) => {
    const descriptor = verseDescriptors[index] || 'playful'
    const pronoun = getPronoun(char.characterGender, 'subject')

    lines.push(`[VERSE ${index + 1}: ${descriptor}]`)
    lines.push(`${char.characterName} oh where do we begin`)

    if (char.characterInterests) {
      const firstInterest = char.characterInterests.split(',')[0].trim()
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} talks about ${firstInterest} again and again`)
    } else {
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} always keeps us on our toes`)
    }

    if (char.characterMention) {
      const mention = char.characterMention.split('.')[0].trim()
      lines.push(mention)
    } else {
      lines.push('But really we all love the way it goes')
    }

    lines.push(`${char.characterName} you know we love you though`)
    lines.push('')
  })

  // CHORUS (4-5 lines)
  lines.push('[CHORUS: laughing, group vocals]')
  lines.push('This roast is made with care')
  lines.push('Just some friendly fun we share')
  lines.push('We tease because we care so much')
  lines.push('With laughter and with love')
  lines.push('')

  // OUTRO (2-3 lines)
  lines.push('[OUTRO: friendly, laugh]')
  lines.push(`To ${allCharacterNames} this song is just for fun`)
  if (fromNames) {
    lines.push(`With love and laughs from ${fromNames}`)
  }
  lines.push('You know we love you everyone')

  return lines.join('\n')
}

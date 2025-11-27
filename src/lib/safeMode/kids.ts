import { SafeModeParams, formatNameList, getPronoun } from './types'

/**
 * Generate Kids song lyrics following Safe Mode rules
 *
 * Structure:
 * - [Music: 145 BPM, bouncy pop, fun instruments, playful voices]
 * - [INTRO: bouncy, excited] (2-3 lines)
 * - One [VERSE] per child (max 4, max 4 lines each)
 * - [CHORUS: energetic, group singing] (4-5 lines)
 * - [OUTRO: happy, playful] (2-3 lines)
 *
 * Constraints:
 * - Very simple, imaginative, no sarcasm
 * - One verse per child (max 4)
 * - Include fromNames in outro
 * - Max 2500 characters total
 */
export function generateKidsPrompt(params: SafeModeParams): string {
  const { toCharacters, senders } = params

  // Get child names for intro/outro
  const childNames = toCharacters.map(c => c.characterName)
  const allChildNames = formatNameList(childNames)

  // Get sender names
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames)

  const lines: string[] = []

  // Music tag
  lines.push('[Music: 145 BPM, bouncy pop, fun instruments, playful voices]')
  lines.push('')

  // INTRO (2-3 lines)
  lines.push('[INTRO: bouncy, excited]')
  lines.push('Jump and dance and sing along')
  lines.push(`This happy song is for ${allChildNames}`)
  lines.push('With lots of fun and silly play')
  lines.push('')

  // VERSES - one per child (max 4)
  const verseDescriptors = ['silly, energetic', 'fun', 'playful', 'happy']
  toCharacters.slice(0, 4).forEach((child, index) => {
    const descriptor = verseDescriptors[index] || 'happy'
    const pronoun = getPronoun(child.characterGender, 'subject')

    lines.push(`[VERSE ${index + 1}: ${descriptor}]`)
    lines.push(`${child.characterName} loves to laugh and play`)

    if (child.characterInterests) {
      const firstInterest = child.characterInterests.split(',')[0].trim()
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} enjoys ${firstInterest} every day`)
    } else {
      lines.push(`${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} makes us smile in every way`)
    }

    if (child.characterMention) {
      const mention = child.characterMention.split('.')[0].trim()
      lines.push(mention)
    } else {
      lines.push('With joy and wonder all around')
    }

    lines.push(`${child.characterName} brings sunshine and delight`)
    lines.push('')
  })

  // CHORUS (4-5 lines)
  lines.push('[CHORUS: energetic, group singing]')
  lines.push('Clap your hands and stomp your feet')
  lines.push('Dancing to this happy beat')
  lines.push('Jump around and have some fun')
  lines.push('Everybody everyone')
  lines.push('')

  // OUTRO (2-3 lines)
  lines.push('[OUTRO: happy, playful]')
  lines.push(`To ${allChildNames} this song is yours`)
  if (fromNames) {
    lines.push(`With love from ${fromNames}`)
  }
  lines.push('Keep on playing and exploring more')

  return lines.join('\n')
}

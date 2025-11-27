import { SafeModeParams, formatNameList } from './types'

/**
 * Generate Leaving Gift song lyrics following Safe Mode rules
 *
 * Structure:
 * - [Music: 85 BPM, soft rock ballad, piano, strings, gentle harmonies]
 * - [INTRO: soft] (2-3 lines)
 * - [VERSE 1: warm, emotional] (max 4 lines)
 * - [CHORUS: heartfelt, harmony] (4-5 lines)
 * - [OUTRO: gentle, fade out] (2-3 lines)
 *
 * Constraints:
 * - Exactly 1 character (leaving person)
 * - Mention the leaving person's name at least 3 times throughout
 * - Include memories and well wishes
 * - Include fromNames in outro
 * - Max 2500 characters total
 */
export function generateLeavingGiftPrompt(params: SafeModeParams): string {
  const { toCharacters, senders } = params

  // Leaving gift must have exactly 1 character
  if (toCharacters.length !== 1) {
    throw new Error('Leaving gift songs must have exactly 1 recipient')
  }

  const character = toCharacters[0]
  const name = character.characterName

  // Get sender names
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames)

  const lines: string[] = []

  // Music tag
  lines.push('[Music: 85 BPM, soft rock ballad, piano, strings, gentle harmonies]')
  lines.push('')

  // INTRO (2-3 lines) - mention name (1st time)
  lines.push('[INTRO: soft]')
  lines.push(`${name} this song is meant for you`)
  lines.push('As you move forward to something new')
  lines.push('We gather here to wish you well')
  lines.push('')

  // VERSE 1 (4 lines) - mention name (2nd time)
  lines.push('[VERSE 1: warm, emotional]')
  lines.push(`${name} you made this place feel like home`)

  if (character.characterInterests) {
    const firstInterest = character.characterInterests.split(',')[0].trim()
    lines.push(`Your love for ${firstInterest} and all you shared`)
  } else {
    lines.push('The kindness and the care you showed')
  }

  if (character.characterMention) {
    const mention = character.characterMention.split('.')[0].trim()
    lines.push(mention)
  } else {
    lines.push('Will stay with us wherever you go')
  }

  lines.push('These memories will always stay')
  lines.push('')

  // CHORUS (4-5 lines) - mention name (3rd time)
  lines.push('[CHORUS: heartfelt, harmony]')
  lines.push(`${name} we wish you all the best`)
  lines.push('On this new path you take')
  lines.push('Thank you for the memories we made')
  lines.push('And every moment that we shared')
  lines.push('May your future shine so bright')
  lines.push('')

  // OUTRO (2-3 lines)
  lines.push('[OUTRO: gentle, fade out]')
  if (fromNames) {
    lines.push(`From all of us, from ${fromNames}`)
  } else {
    lines.push('From all of us who care')
  }
  lines.push(`${name} we wish you well`)
  lines.push('Good luck and take care')

  return lines.join('\n')
}

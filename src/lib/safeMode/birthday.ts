import { SafeModeParams, formatNameList } from './types'

/**
 * Generate Birthday song lyrics following Safe Mode rules
 *
 * Structure:
 * - [Music: 130 BPM, pop rock, upbeat drums, crowd cheering]
 * - [INTRO: fireworks] (2-3 lines)
 * - [VERSE 1: upbeat] (max 4 lines)
 * - [CHORUS: cheering, group vocals] (4-5 lines)
 * - [OUTRO: celebration, with clapping] (2-3 lines)
 *
 * Constraints:
 * - Exactly 1 character (birthday person)
 * - Mention the birthday person's name at least 3 times throughout
 * - Include fromNames in outro
 * - Max 2500 characters total
 */
export function generateBirthdayPrompt(params: SafeModeParams): string {
  const { toCharacters, senders } = params

  // Birthday must have exactly 1 character
  if (toCharacters.length !== 1) {
    throw new Error('Birthday songs must have exactly 1 recipient')
  }

  const character = toCharacters[0]
  const name = character.characterName

  // Get sender names
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames)

  const lines: string[] = []

  // Music tag
  lines.push('[Music: 130 BPM, pop rock, upbeat drums, crowd cheering]')
  lines.push('')

  // INTRO (2-3 lines) - mention name (1st time)
  lines.push('[INTRO: fireworks]')
  lines.push(`Today is all about ${name}`)
  lines.push('Light the candles and bring the fun')
  lines.push('Let the celebration now begin')
  lines.push('')

  // VERSE 1 (4 lines) - mention name (2nd time)
  lines.push('[VERSE 1: upbeat]')
  lines.push(`${name} you light up every room`)

  if (character.characterInterests) {
    const firstInterest = character.characterInterests.split(',')[0].trim()
    lines.push(`You love ${firstInterest} and make life bright`)
  } else {
    lines.push('You make the world a better place')
  }

  if (character.characterMention) {
    const mention = character.characterMention.split('.')[0].trim()
    lines.push(mention)
  } else {
    lines.push('Every moment with you feels right')
  }

  lines.push('This special day belongs to you')
  lines.push('')

  // CHORUS (4-5 lines) - mention name (3rd time)
  lines.push('[CHORUS: cheering, group vocals]')
  lines.push(`Happy birthday ${name}`)
  lines.push('Sing it loud and make some noise')
  lines.push('Dance around and celebrate')
  lines.push('This is your day to shine so bright')
  lines.push('Happy birthday to you tonight')
  lines.push('')

  // OUTRO (2-3 lines)
  lines.push('[OUTRO: celebration, with clapping]')
  lines.push(`${name} this song is just for you`)
  if (fromNames) {
    lines.push(`With love from ${fromNames}`)
  }
  lines.push('Happy birthday and may your dreams come true')

  return lines.join('\n')
}

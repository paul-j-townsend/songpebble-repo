import { ToCharacter, Sender } from './songSchema'

/**
 * Formats an array of names with proper grammar
 * - 1 name: "Alice"
 * - 2 names: "Alice and Bob"
 * - 3+ names: "Alice, Bob and Charlie"
 */
function formatNameList(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`

  // 3 or more: "name1, name2 and name3"
  const allButLast = names.slice(0, -1).join(', ')
  const last = names[names.length - 1]
  return `${allButLast} and ${last}`
}

/**
 * Builds a rich style description combining user preferences
 * Used for the API.box 'style' parameter
 */
export function buildSongStyle(params: {
  songStyle?: string
  songMood?: string
  tempo?: string
  instruments?: string[]
  vocalGender?: string
}): string {
  const parts: string[] = []

  // Base style: user's genre
  const userStyle = params.songStyle || 'pop'
  // Normalize the style to lowercase for further checks
  const styleLower = userStyle.toLowerCase()
  parts.push(`${styleLower}`)

  // Special case: for hip hop, also add "rap" to highlight vocal style
  // (covers both "hip hop" and "hip-hop" spelling variations)
  if (styleLower === 'hip hop' || styleLower === 'hip-hop') {
    parts.push('rap')
  }

  // Add vocal type if provided
  if (params.vocalGender) {
    const vocalLabels: Record<string, string> = {
      'male': 'male vocals',
      'female': 'female vocals'
    }
    const vocalDesc = vocalLabels[params.vocalGender]
    if (vocalDesc) {
      parts.push(vocalDesc)
    }
  }

  // Add mood if provided
  if (params.songMood) {
    parts.push(params.songMood.toLowerCase())
  }

  // Add tempo descriptor
  if (params.tempo) {
    const tempoMap: Record<string, string> = {
      slow: 'slow and gentle',
      medium: 'medium tempo',
      fast: 'upbeat',
      'very-fast': 'energetic'
    }
    const tempoDesc = tempoMap[params.tempo]
    if (tempoDesc) {
      parts.push(tempoDesc)
    }
  }

  // Add user's selected instruments
  if (params.instruments && params.instruments.length > 0) {
    parts.push(...params.instruments)
  }

  return parts.join(', ')
}

/**
 * Generates a song prompt from character and sender data
 * using a structured template with conditional phrases.
 */
export function generateSongPrompt(params: {
  toCharacters: ToCharacter[]
  senders: Sender[]
  songStyle?: string
  songMood?: string
  tempo?: string
  instruments?: string[]
  vocalGender?: string
}): string {
  const { toCharacters, senders, songStyle, songMood, tempo, instruments, vocalGender } = params

  // Ensure we have at least one recipient and sender (defensive programming)
  const safeToCharacters = toCharacters.length > 0
    ? toCharacters
    : [{ characterName: 'You', characterGender: undefined, characterInterests: undefined, characterMention: undefined }]

  const safeSenders = senders.length > 0
    ? senders
    : [{ senderName: 'Your Friends' }]

  // Extract all character names for intro/outro with proper grammar
  const characterNames = safeToCharacters.map(char => char.characterName)
  const allCharacterNames = formatNameList(characterNames)

  // Extract sender names for outro with proper grammar
  const senderNames = safeSenders.map(sender => sender.senderName)
  const recipientNames = formatNameList(senderNames)

  // Build style tags
  const styleTags = buildSongStyle({ songStyle, songMood, tempo, instruments, vocalGender })

  // Build verses for each character
  const verses = safeToCharacters.map(char => {
    // Gender phrase logic
    let genderPhrase: string
    if (char.characterGender === 'male') {
      genderPhrase = 'He turns small moments into something lasting,'
    } else if (char.characterGender === 'female') {
      genderPhrase = 'She turns small moments into something lasting,'
    } else {
      genderPhrase = 'They turn small moments into something lasting,'
    }

    // Interest phrase logic
    const interestPhrase = char.characterInterests
      ? `Loves ${char.characterInterests}, and it shows in everything.`
      : ''

    // Mention phrase logic
    const mentionPhrase = char.characterMention
      ? ` ${char.characterMention}`
      : ''

    // Build the verse, removing extra spaces
    const verseLine2 = `${genderPhrase} ${interestPhrase}${mentionPhrase}`.trim()

    return `[VERSE]
${char.characterName} brings a steady warmth,
${verseLine2}`
  }).join('\n\n')

  // Assemble the full prompt
  const prompt = `Tags: ${styleTags}

[INTRO]
This song is for ${allCharacterNames}

${verses}

[CHORUS]
Celebrate the moments that we share,
Every smile and every bit of care.


[OUTRO]
This song is dedicated to ${allCharacterNames}
With love from ${recipientNames}.`

  return prompt
}

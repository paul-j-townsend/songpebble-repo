import Anthropic from '@anthropic-ai/sdk'
import type { ToCharacter, Sender } from './songSchema'
import type { Occasion, Tone } from './safeMode/types'
import { formatNameList } from './safeMode/types'
import { validateLyrics } from './validateLyrics'
import { getFromCache, saveToCache, generateCacheKey } from './lyricsCache'

/**
 * Result from Claude API lyrics generation
 */
export interface ClaudeGenerationResult {
  lyrics: string
  provider: 'claude' | 'template'
  attempts: number
  errors: string[]
  cached: boolean
  validationPassed: boolean
}

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set')
  }

  return new Anthropic({ apiKey })
}

/**
 * Build comprehensive system prompt with all Safe Mode rules
 */
function buildSystemPrompt(): string {
  return `You are an expert song lyricist creating personalized songs for special occasions. Your lyrics MUST strictly follow the Safe Mode format for AI music generation.

CRITICAL STRUCTURE REQUIREMENTS:
1. Start with [Music: BPM, genre, instruments, mood] tag
2. Include these sections in order: [INTRO], [VERSE], [CHORUS], [OUTRO]
3. Section tags use format: [SECTION: descriptor] (e.g., [INTRO: bells ringing])
4. Maximum 2500 characters total

LINE LIMITS PER SECTION:
- [INTRO]: 2-3 lines maximum
- [VERSE]: 4 lines maximum per verse
- [CHORUS]: 4-5 lines maximum
- [OUTRO]: 2-3 lines maximum

FORBIDDEN ELEMENTS (will cause generation to fail):
- NO emojis of any kind
- NO parentheses ()
- NO special characters (only letters, numbers, basic punctuation: , . ! ? ' -)
- NO brackets [] except in section headers
- NO slang or complex metaphors
- NO archaic/formal words: kin, folk, thee, thy, beloved, cherished, brethren, jubilation, farewell, whilst, festive, rejoice, glory, splendor, hearth, abode
- NO Americanisms: candy, sidewalk, truck, vacation, apartment, elevator, mom, diaper, cookie, trash, soccer

LANGUAGE REQUIREMENTS:
- Use simple, singable, conversational language
- International English only
- Easy to remember and perform
- Clear emotional tone

OCCASION-SPECIFIC MUSIC TAGS:
- Christmas: [Music: 110 BPM, folk rock, acoustic guitar, bells, warm harmonies]
- Birthday: [Music: 130 BPM, pop rock, upbeat drums, crowd cheering]
- Leaving gift: [Music: 85 BPM, soft rock ballad, piano, strings, gentle harmonies]
- Roast: [Music: 125 BPM, rock, electric guitar, playful energy]
- Pets: [Music: 105 BPM, indie pop, ukulele, playful, light harmonies]
- Kids: [Music: 145 BPM, bouncy pop, fun instruments, playful voices]

OUTPUT ONLY the lyrics with section headers. NO explanations, NO commentary, NO meta-text.`
}

/**
 * Build user message with occasion and character details
 */
function buildUserMessage(
  occasion: Occasion,
  tone: Tone | undefined,
  toCharacters: ToCharacter[],
  senders: Sender[],
  songTitle: string
): string {
  const characterNames = toCharacters.map(c => c.characterName)
  const allCharacterNames = formatNameList(characterNames)
  const senderNames = senders.map(s => s.senderName)
  const fromNames = formatNameList(senderNames) || 'Anonymous'

  let message = `Generate lyrics for a ${occasion} song`
  if (tone) {
    message += ` with a ${tone} tone`
  }
  message += `.\n\n`

  message += `**Song Title:** ${songTitle}\n\n`

  message += `**Recipients (${toCharacters.length}):**\n`
  toCharacters.forEach((char, index) => {
    message += `${index + 1}. Name: ${char.characterName}\n`
    if (char.characterGender) {
      message += `   Gender: ${char.characterGender}\n`
    }
    if (char.characterInterests) {
      message += `   Interests: ${char.characterInterests}\n`
    }
    if (char.characterMention) {
      message += `   Special mention: ${char.characterMention}\n`
    }
  })

  message += `\n**From:** ${fromNames}\n\n`

  // Occasion-specific instructions
  message += `**Occasion Requirements for "${occasion}":**\n`
  switch (occasion) {
    case 'christmas':
      message += `- Use the Christmas music tag: [Music: 110 BPM, folk rock, acoustic guitar, bells, warm harmonies]
- Create one [VERSE] per recipient (max 6 verses)
- Use descriptors: upbeat, cheerful, joyful, warm, bright, happy
- Mention Christmas, warmth, bells, snow
- End [OUTRO] with "Merry Christmas and a happy new year"
- Include "With love from ${fromNames}" in outro\n`
      break

    case 'birthday':
      message += `- Use the Birthday music tag: [Music: 130 BPM, pop rock, upbeat drums, crowd cheering]
- Create ONLY 1 verse (exactly 1 recipient required)
- Mention ${characterNames[0]}'s name at least 3 times throughout the song
- Use celebration, fireworks, clapping themes
- End with birthday wishes
- Include "With love from ${fromNames}" in outro\n`
      break

    case 'leaving-gift':
      message += `- Use the Leaving gift music tag: [Music: 85 BPM, soft rock ballad, piano, strings, gentle harmonies]
- Create ONLY 1 verse (exactly 1 recipient required)
- Mention ${characterNames[0]}'s name at least 3 times throughout the song
- Include memories and well wishes
- Warm, emotional, heartfelt tone
- Include "From ${fromNames}" in outro\n`
      break

    case 'roast':
      message += `- Use the Roast music tag: [Music: 125 BPM, rock, electric guitar, playful energy]
- Create one [VERSE] per recipient (max 6 verses)
- Use descriptors: cheeky, teasing, playful, silly, light, funny
- Keep teasing light and friendly (no harsh words)
- Include laughter and playful energy
- Include "With love from ${fromNames}" in outro\n`
      break

    case 'pets':
      message += `- Use the Pets music tag: [Music: 105 BPM, indie pop, ukulele, playful, light harmonies]
- Create one [VERSE] per pet (max 4 verses)
- Use descriptors: cute, sweet voice, adorable, playful, sweet
- Describe pet behavior cutely
- Warm, affectionate tone
- Include "From ${fromNames}" in outro\n`
      break

    case 'kids':
      message += `- Use the Kids music tag: [Music: 145 BPM, bouncy pop, fun instruments, playful voices]
- Create one [VERSE] per child (max 4 verses)
- Use descriptors: silly, energetic, fun, playful, happy
- Very simple language, imaginative, no sarcasm
- Include "With love from ${fromNames}" in outro\n`
      break
  }

  message += `\nRemember: Follow ALL Safe Mode rules strictly. Output ONLY the lyrics.`

  return message
}

/**
 * Call Claude API with retry logic
 */
async function callClaudeAPI(
  systemPrompt: string,
  userMessage: string,
  attempt: number = 1
): Promise<string> {
  const anthropic = getAnthropicClient()

  const startTime = Date.now()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const responseTime = Date.now() - startTime

    // Extract text from response
    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    console.log(`✅ Claude API success (attempt ${attempt}, ${responseTime}ms, ${response.usage.input_tokens} in / ${response.usage.output_tokens} out)`)

    return textContent.text
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Claude API error (attempt ${attempt}, ${responseTime}ms):`, error)
    throw error
  }
}

/**
 * Generate lyrics with Claude API (with retry logic and caching)
 */
export async function generateLyricsWithClaude(
  occasion: Occasion,
  data: {
    toCharacters: ToCharacter[]
    senders: Sender[]
    tone?: Tone
    songTitle?: string
  },
  options: {
    skipCache?: boolean
    isPaidOrder?: boolean
  } = {}
): Promise<ClaudeGenerationResult> {
  const { toCharacters, senders, tone } = data
  const songTitle = data.songTitle || 'Untitled Song'
  const errors: string[] = []

  // Generate cache key
  const cacheKey = generateCacheKey(occasion, tone, toCharacters, senders)

  // Check cache (skip for paid orders)
  if (!options.skipCache && !options.isPaidOrder) {
    const cachedLyrics = getFromCache(cacheKey)
    if (cachedLyrics) {
      return {
        lyrics: cachedLyrics,
        provider: 'claude',
        attempts: 0,
        errors: [],
        cached: true,
        validationPassed: true,
      }
    }
  }

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userMessage = buildUserMessage(occasion, tone, toCharacters, senders, songTitle)

  // Attempt 1: Immediate call
  try {
    const lyrics = await callClaudeAPI(systemPrompt, userMessage, 1)

    // Validate
    const validation = validateLyrics(lyrics, occasion, toCharacters.length)

    if (!validation.valid) {
      console.warn('⚠️  Claude lyrics failed validation:', validation.errors)
      errors.push(...validation.errors)
      // Don't return yet, try again
      throw new Error('Validation failed')
    }

    // Save to cache (skip for paid orders)
    if (!options.isPaidOrder) {
      saveToCache(cacheKey, validation.cleanedLyrics, 'claude')
    }

    return {
      lyrics: validation.cleanedLyrics,
      provider: 'claude',
      attempts: 1,
      errors: validation.warnings,
      cached: false,
      validationPassed: true,
    }
  } catch (error1) {
    errors.push(`Attempt 1: ${error1 instanceof Error ? error1.message : 'Unknown error'}`)

    // Wait 2 seconds before retry
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Attempt 2: Retry after backoff
    try {
      const lyrics = await callClaudeAPI(systemPrompt, userMessage, 2)

      // Validate
      const validation = validateLyrics(lyrics, occasion, toCharacters.length)

      if (!validation.valid) {
        console.warn('⚠️  Claude lyrics failed validation (attempt 2):', validation.errors)
        errors.push(...validation.errors)
        // Return failure, will fallback to templates
        return {
          lyrics: '',
          provider: 'template',
          attempts: 2,
          errors,
          cached: false,
          validationPassed: false,
        }
      }

      // Save to cache (skip for paid orders)
      if (!options.isPaidOrder) {
        saveToCache(cacheKey, validation.cleanedLyrics, 'claude')
      }

      return {
        lyrics: validation.cleanedLyrics,
        provider: 'claude',
        attempts: 2,
        errors: validation.warnings,
        cached: false,
        validationPassed: true,
      }
    } catch (error2) {
      errors.push(`Attempt 2: ${error2 instanceof Error ? error2.message : 'Unknown error'}`)

      // Both attempts failed, return failure
      console.error('❌ Claude API failed after 2 attempts, will fallback to templates')
      return {
        lyrics: '',
        provider: 'template',
        attempts: 2,
        errors,
        cached: false,
        validationPassed: false,
      }
    }
  }
}

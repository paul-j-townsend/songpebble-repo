'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { songFormSchema, type SongFormData } from '@/lib/songSchema'
import { useState } from 'react'
import { generateChristmasPrompt } from '@/lib/promptGenerator'

const SONG_STYLES = [
  'Pop',
  'Rock',
  'Country',
  'Jazz',
  'Blues',
  'Hip Hop',
  'R&B',
  'Electronic',
  'Folk',
  'Classical',
  'Reggae',
  'Metal',
  'Indie',
  'Soul',
  'Funk',
]

const SONG_MOODS = [
  'Happy',
  'Sad',
  'Energetic',
  'Calm',
  'Romantic',
  'Melancholic',
  'Uplifting',
  'Dark',
  'Playful',
  'Inspirational',
  'Nostalgic',
  'Mysterious',
]

export default function SongForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(true)
  const [copiedStyle, setCopiedStyle] = useState(false)
  const [copiedLyrics, setCopiedLyrics] = useState(false)
  const [expandedToCharacters, setExpandedToCharacters] = useState<Set<number>>(new Set())

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<SongFormData>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      customerEmail: 'santa@northpole.com',
      customerName: 'Buddy Elf',
      songTitle: 'Santa\'s Rockin\' Sleigh Ride',
      songStyle: 'Pop',
      songMood: 'Playful',
      vocalGender: 'female',
      tempo: 'fast',
      instruments: ['piano', 'drums'],
      toCharacters: [
        {
          characterName: 'Andy',
          characterGender: 'male' as const,
          characterInterests: 'Building snowmen, drinking hot cocoa, and waiting for Santa',
          characterMention: 'Believes in Santa with all his heart and writes letters to the North Pole',
        },
      ],
      senders: [],
      lyricsInput: '',
    },
  })

  // Dynamic to character fields management
  const { fields: toCharacterFields, append: appendToCharacter, remove: removeToCharacter } = useFieldArray({
    control,
    name: 'toCharacters',
  })


  // Toggle to character card expansion
  const toggleToCharacter = (index: number) => {
    setExpandedToCharacters((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }


  // Watch all form values for prompt generation
  const formValues = watch()

  // Helper to get/set sender name from the senders array
  const senderName = formValues.senders?.[0]?.senderName || ''
  const handleSenderNameChange = (value: string) => {
    if (value) {
      setValue('senders', [{ senderName: value }])
    } else {
      setValue('senders', [])
    }
  }

  // Build Suno AI prompt from form values
  const buildSunoPrompt = () => {
    const parts: string[] = []

    // Add style (required)
    if (formValues.songStyle) {
      parts.push(formValues.songStyle)
      
      // Special case: for hip hop, also add "rap" to highlight vocal style
      const styleLower = formValues.songStyle.toLowerCase()
      if (styleLower === 'hip hop' || styleLower === 'hip-hop') {
        parts.push('rap')
      }
    }

    // Add vocal type
    if (formValues.vocalGender) {
      const vocalLabels: Record<string, string> = {
        'male': 'male vocals',
        'female': 'female vocals'
      }
      parts.push(`with ${vocalLabels[formValues.vocalGender] || formValues.vocalGender}`)
    }

    // Add mood
    if (formValues.songMood) {
      parts.push(`${formValues.songMood.toLowerCase()} mood`)
    }

    // Add instruments
    if (formValues.instruments && formValues.instruments.length > 0) {
      parts.push(`featuring ${formValues.instruments.join(', ')}`)
    }

    // Add tempo
    if (formValues.tempo) {
      const tempoLabels: Record<string, string> = {
        'slow': 'slow tempo (60-80 BPM)',
        'medium': 'medium tempo (90-120 BPM)',
        'fast': 'fast tempo (130-160 BPM)',
        'very-fast': 'very fast tempo (160+ BPM)'
      }
      parts.push(tempoLabels[formValues.tempo] || formValues.tempo)
    }

    return parts.join(', ')
  }

  // Copy style prompt to clipboard
  const copyStylePrompt = async () => {
    const prompt = buildSunoPrompt()
    if (prompt) {
      await navigator.clipboard.writeText(prompt)
      setCopiedStyle(true)
      setTimeout(() => setCopiedStyle(false), 2000)
    }
  }

  // Copy lyrics to clipboard
  const copyLyrics = async () => {
    if (formValues.lyricsInput) {
      await navigator.clipboard.writeText(formValues.lyricsInput)
      setCopiedLyrics(true)
      setTimeout(() => setCopiedLyrics(false), 2000)
    }
  }

  // Clear lyrics field
  const clearLyrics = () => {
    setValue('lyricsInput', '')
  }

  // Test prompt creation - generates Christmas prompt from current form data
  const testPromptCreation = () => {
    const generatedPrompt = generateChristmasPrompt({
      toCharacters: formValues.toCharacters || [],
      senders: formValues.senders || [],
      songStyle: formValues.songStyle,
      songMood: formValues.songMood,
      tempo: formValues.tempo,
      instruments: formValues.instruments,
      vocalGender: formValues.vocalGender,
    })
    setValue('lyricsInput', generatedPrompt)
  }

  // Clear all form fields (maintains minimum 1 recipient and 1 sender)
  const clearAllFields = () => {
    reset({
      customerEmail: '',
      customerName: '',
      songTitle: '',
      songStyle: '',
      songMood: '',
      vocalGender: '',
      tempo: '',
      instruments: [],
      toCharacters: [
        {
          characterName: '',
          characterGender: undefined,
          characterInterests: '',
          characterMention: '',
        },
      ],
      senders: [],
      lyricsInput: '',
    })
    setExpandedToCharacters(new Set([0]))
  }

  // Load default test values
  const loadDefaultValues = () => {
    reset({
      customerEmail: 'santa@northpole.com',
      customerName: 'Buddy Elf',
      songTitle: 'Santa\'s Rockin\' Sleigh Ride',
      songStyle: 'Pop',
      songMood: 'Playful',
      vocalGender: 'female',
      tempo: 'fast',
      instruments: ['piano', 'drums'],
      toCharacters: [
        {
          characterName: 'Paul',
          characterGender: 'male' as const,
          characterInterests: 'Building snowmen, drinking hot cocoa, and waiting for Santa',
          characterMention: 'Believes in Santa with all his heart and writes letters to the North Pole',
        },
      ],
      senders: [
        {
          senderName: 'Paul',
        },
      ],
      lyricsInput: `[Intro]
Ho ho ho! Can you hear those jingle bells ring?
Santa's loading up the sleigh, hear the reindeer sing!

[Verse 1]
Reindeer ready on the roof, Rudolph's nose is bright,
Eight tiny hooves are dancing in the starlight.
Chimney after chimney, sliding down with cheer,
Leaving presents for the ones we hold so dear!

[Pre-Chorus]
The workshop's been buzzing, elves worked through the night,
Now it's time to spread the joy and Christmas light!

[Chorus]
Santa's rockin' on his sleigh ride tonight,
Zooming through the sky with presents shining bright!
Jingle bells are ringing loud across the winter sky,
It's Christmas magic, watch Santa fly by!

[Verse 2]
Cookies and some milk at every single door,
Santa's belly's getting full, but he wants more!
Mrs. Claus is waving from the North Pole way up high,
"Faster Santa, faster! You've got kids to satisfy!"

[Pre-Chorus]
The nice list's checked twice, everyone gets love tonight,
Because Christmas is the season when we all shine bright!

[Chorus]
Santa's rockin' on his sleigh ride tonight,
Zooming through the sky with presents shining bright!
Jingle bells are ringing loud across the winter sky,
It's Christmas magic, watch Santa fly by!

[Bridge]
From Tokyo to Paris, Cairo to LA,
Every child is dreaming on this special day!
Snowflakes falling gently as the sleigh bells chime,
It's the greatest, merriest, most magical time!

[Final Chorus]
Santa's rockin' on his sleigh ride tonight,
Spreading joy and wonder, making spirits bright!
Jingle bells are ringing out for you and me,
Merry Christmas everyone, under every tree!

[Outro]
The mission's done, the world's asleep and tight,
Merry Christmas to all, and to all a good night!`,
    })
    // Expand the 2 test to characters
    setExpandedToCharacters(new Set([0, 1]))
  }

  const onSubmit = async (data: SongFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order')
      }

      // Redirect to Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      console.error('Form submission error:', err)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      {/* Customer Email */}
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="customerEmail"
          type="email"
          {...register('customerEmail')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent"
          placeholder="your@email.com"
        />
        {errors.customerEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
        )}
      </div>

      {/* Customer Name */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="customerName"
          type="text"
          {...register('customerName')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent"
          placeholder="John Doe"
        />
        {errors.customerName && (
          <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
        )}
      </div>

      {/* Song Title */}
      <div>
        <label htmlFor="songTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Song Title <span className="text-red-500">*</span>
        </label>
        <input
          id="songTitle"
          type="text"
          {...register('songTitle')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent"
          placeholder="My Custom Song"
        />
        {errors.songTitle && (
          <p className="mt-1 text-sm text-red-600">{errors.songTitle.message}</p>
        )}
      </div>

      {/* Song Style */}
      <div>
        <label htmlFor="songStyle" className="block text-sm font-medium text-gray-700 mb-1">
          Song Style <span className="text-red-500">*</span>
        </label>
        <select
          id="songStyle"
          {...register('songStyle')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent bg-white"
        >
          <option value="">Select a style...</option>
          {SONG_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
        {errors.songStyle && (
          <p className="mt-1 text-sm text-red-600">{errors.songStyle.message}</p>
        )}
      </div>

      {/* Song Mood (Optional) */}
      <div>
        <label htmlFor="songMood" className="block text-sm font-medium text-gray-700 mb-1">
          Song Mood <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <select
          id="songMood"
          {...register('songMood')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent bg-white"
        >
          <option value="">Select a mood...</option>
          {SONG_MOODS.map((mood) => (
            <option key={mood} value={mood}>
              {mood}
            </option>
          ))}
        </select>
        {errors.songMood && (
          <p className="mt-1 text-sm text-red-600">{errors.songMood.message}</p>
        )}
      </div>

      {/* Vocal Gender (Optional) */}
      <div>
        <label htmlFor="vocalGender" className="block text-sm font-medium text-gray-700 mb-1">
          Vocal Type <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <select
          id="vocalGender"
          {...register('vocalGender')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent bg-white"
        >
          <option value="">Select vocal type...</option>
          <option value="male">Male Vocals</option>
          <option value="female">Female Vocals</option>
        </select>
        {errors.vocalGender && (
          <p className="mt-1 text-sm text-red-600">{errors.vocalGender.message}</p>
        )}
      </div>

      {/* Tempo (Optional) */}
      <div>
        <label htmlFor="tempo" className="block text-sm font-medium text-gray-700 mb-1">
          Tempo <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <select
          id="tempo"
          {...register('tempo')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent bg-white"
        >
          <option value="">Select tempo...</option>
          <option value="slow">Slow (60-80 BPM)</option>
          <option value="medium">Medium (90-120 BPM)</option>
          <option value="fast">Fast (130-160 BPM)</option>
          <option value="very-fast">Very Fast (160+ BPM)</option>
        </select>
        {errors.tempo && (
          <p className="mt-1 text-sm text-red-600">{errors.tempo.message}</p>
        )}
      </div>

      {/* Instruments (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key Instruments <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="guitar"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Guitar</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="piano"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Piano</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="synth"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Synth</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="drums"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Drums</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="strings"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Strings</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="brass"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Brass</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="bass"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Bass</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="electronic"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Electronic</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="orchestral"
              {...register('instruments')}
              className="rounded border-gray-300 text-christmas-red focus:ring-christmas-gold"
            />
            <span className="text-sm text-gray-700">Orchestral</span>
          </label>
        </div>
        {errors.instruments && (
          <p className="mt-1 text-sm text-red-600">{errors.instruments.message}</p>
        )}
      </div>

      {/* To Characters Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              To <span className="text-gray-400 text-sm font-normal">(recipients - optional)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add up to 8 recipients to personalize your song
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {toCharacterFields.length}/8
            </span>
            <button
              type="button"
              onClick={() => {
                const newIndex = toCharacterFields.length
                appendToCharacter({
                  characterName: '',
                  characterGender: undefined,
                  characterInterests: '',
                  characterMention: '',
                })
                setExpandedToCharacters((prev) => {
                  const newSet = new Set(prev)
                  newSet.add(newIndex)
                  return newSet
                })
              }}
              disabled={toCharacterFields.length >= 8}
              className="flex items-center gap-2 px-4 py-2 bg-christmas-red text-white text-sm font-medium rounded-lg hover:bg-christmas-red-dark focus:outline-none focus:ring-2 focus:ring-christmas-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Recipient
            </button>
          </div>
        </div>

        {toCharacterFields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 font-medium">No recipients added yet</p>
            <p className="text-gray-500 text-sm mt-1">Click &quot;Add Recipient&quot; to personalize the song</p>
          </div>
        )}

        <div className="space-y-4">
          {toCharacterFields.map((field, index) => {
            const isExpanded = expandedToCharacters.has(index)
            const characterName = formValues.toCharacters?.[index]?.characterName || `Recipient ${index + 1}`

            return (
              <div key={field.id} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                {/* Character Card Header */}
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleToCharacter(index)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-transform"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-700 truncate">
                        {characterName}
                      </h4>
                      {!isExpanded && formValues.toCharacters?.[index]?.characterGender && (
                        <p className="text-xs text-gray-500 capitalize">
                          {formValues.toCharacters[index].characterGender}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeToCharacter(index)
                      // Adjust expanded state
                      setExpandedToCharacters((prev) => {
                        const newSet = new Set<number>()
                        prev.forEach((i) => {
                          if (i < index) {
                            newSet.add(i)
                          } else if (i > index) {
                            newSet.add(i - 1)
                          }
                        })
                        return newSet
                      })
                    }}
                    className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                    title="Remove recipient"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Character Details (Collapsible) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-200">
                {/* Character Name */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterName`} className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`toCharacters.${index}.characterName`}
                    type="text"
                    {...register(`toCharacters.${index}.characterName` as const)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent text-sm"
                    placeholder="e.g., Sarah, John, etc."
                  />
                  {errors.toCharacters?.[index]?.characterName && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterName?.message}</p>
                  )}
                </div>

                {/* Character Gender */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterGender`} className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <select
                    id={`toCharacters.${index}.characterGender`}
                    {...register(`toCharacters.${index}.characterGender` as const)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent bg-white text-sm"
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.toCharacters?.[index]?.characterGender && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterGender?.message}</p>
                  )}
                </div>

                {/* Character Interests */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterInterests`} className="block text-sm font-medium text-gray-700 mb-1">
                    Interests <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id={`toCharacters.${index}.characterInterests`}
                    {...register(`toCharacters.${index}.characterInterests` as const)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent resize-y text-sm"
                    placeholder="e.g., loves hiking, plays guitar, enjoys cooking..."
                  />
                  {errors.toCharacters?.[index]?.characterInterests && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterInterests?.message}</p>
                  )}
                </div>

                {/* One Thing to Mention */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterMention`} className="block text-sm font-medium text-gray-700 mb-1">
                    One Thing to Mention <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id={`toCharacters.${index}.characterMention`}
                    {...register(`toCharacters.${index}.characterMention` as const)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent resize-y text-sm"
                    placeholder="e.g., always smiles when it rains, has a unique laugh..."
                  />
                  {errors.toCharacters?.[index]?.characterMention && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterMention?.message}</p>
                  )}
                </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {errors.toCharacters && typeof errors.toCharacters === 'object' && !Array.isArray(errors.toCharacters) && (
          <p className="mt-2 text-sm text-red-600">{errors.toCharacters.message}</p>
        )}
      </div>

      {/* Sender Section */}
      <div className="border-t border-gray-200 pt-6">
        <div>
          <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
            From <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            id="senderName"
            type="text"
            value={senderName}
            onChange={(e) => handleSenderNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold focus:border-transparent"
            placeholder="e.g., Mom and Dad, Grandma, etc."
          />
          {errors.senders?.[0]?.senderName && (
            <p className="mt-1 text-sm text-red-600">{errors.senders[0]?.senderName?.message}</p>
          )}
          {errors.senders && typeof errors.senders === 'object' && !Array.isArray(errors.senders) && (
            <p className="mt-1 text-sm text-red-600">{errors.senders.message}</p>
          )}
        </div>
      </div>

      {/* Prompt Preview */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showPrompt ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Hide Suno AI Prompt
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Preview Suno AI Prompt
              </>
            )}
          </button>

          <button
            type="button"
            onClick={testPromptCreation}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate Prompt
          </button>
        </div>

        {showPrompt && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Style Prompt:</h4>
                <button
                  type="button"
                  onClick={copyStylePrompt}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-christmas-red hover:text-christmas-red-dark hover:bg-christmas-snow rounded transition-colors"
                >
                  {copiedStyle ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-900 font-mono bg-white p-3 rounded border border-slate-200">
                {buildSunoPrompt() || 'Fill out the form to see the generated prompt...'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {buildSunoPrompt().length} / 200 characters
              </p>
            </div>

            {formValues.lyricsInput && formValues.lyricsInput.length >= 10 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">Lyrics/Theme:</h4>
                  <button
                    type="button"
                    onClick={copyLyrics}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-christmas-red hover:text-christmas-red-dark hover:bg-christmas-snow rounded transition-colors"
                  >
                    {copiedLyrics ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-slate-200 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                  {formValues.lyricsInput}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formValues.lyricsInput.length} / 2000 characters
                </p>
              </div>
            )}

            <div className="text-xs text-gray-600 bg-christmas-snow border border-christmas-gold-light p-3 rounded">
              <strong>Note:</strong> This is a preview of what will be sent to Suno AI for song generation. The style prompt describes the musical characteristics, while your lyrics/theme provides the content.
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-christmas-red text-white py-3 px-6 rounded-lg font-medium hover:bg-christmas-red-dark focus:outline-none focus:ring-2 focus:ring-christmas-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Create My Song - £20'}
        </button>

        {/* Test with Form Data Button (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={async () => {
              const testData = {
                ...formValues,
                senderName: senderName, // Include single sender name
              }
              console.log('🧪 [FORM] Testing with form data:', testData)
              try {
                const response = await fetch('/api/test-box-api', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(testData),
                })
                const result = await response.json()
                if (result.success) {
                  alert(`✅ Test successful! Task ID: ${result.taskId}`)
                } else {
                  alert(`❌ Test failed: ${result.error}`)
                }
              } catch (error) {
                alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
          >
            🧪 Test API with Form Data (Dev Only)
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={loadDefaultValues}
            className="flex items-center justify-center gap-2 bg-white text-christmas-green py-2 px-4 rounded-lg font-medium border border-christmas-green-light hover:bg-christmas-snow focus:outline-none focus:ring-2 focus:ring-christmas-gold focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Load Test Data
          </button>

          <button
            type="button"
            onClick={clearAllFields}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        You&apos;ll be redirected to Stripe to complete your payment
      </p>
    </form>
  )
}

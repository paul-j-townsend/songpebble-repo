'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { songFormSchema, type SongFormData } from '@/lib/songSchema'
import { useState } from 'react'

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
  const [showPrompt, setShowPrompt] = useState(false)
  const [copiedStyle, setCopiedStyle] = useState(false)
  const [copiedLyrics, setCopiedLyrics] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SongFormData>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      songTitle: 'My Epic Journey',
      songStyle: 'Rock',
      songMood: 'Energetic',
      vocalGender: 'female',
      tempo: 'medium',
      instruments: ['guitar', 'drums', 'bass'],
      lyricsInput: `[Verse 1]
Standing on the edge of something new
The world is waiting, what will we do
Every moment leads us to the light
We're gonna make it through the night

[Chorus]
We will rise, we will shine
This is our moment, our time
Together we'll reach for the sky
We will rise, we will fly

[Verse 2]
Dreams are calling from beyond the stars
Nothing's gonna stop us, here we are
With every heartbeat, we're alive
Together we will thrive

[Chorus]
We will rise, we will shine
This is our moment, our time
Together we'll reach for the sky
We will rise, we will fly`,
    },
  })

  // Watch all form values for prompt generation
  const formValues = watch()

  // Build Suno AI prompt from form values
  const buildSunoPrompt = () => {
    const parts: string[] = []

    // Add style (required)
    if (formValues.songStyle) {
      parts.push(formValues.songStyle)
    }

    // Add vocal type
    if (formValues.vocalGender && formValues.vocalGender !== 'instrumental') {
      const vocalLabels: Record<string, string> = {
        'male': 'male vocals',
        'female': 'female vocals',
        'mixed': 'mixed vocals'
      }
      parts.push(`with ${vocalLabels[formValues.vocalGender] || formValues.vocalGender}`)
    } else if (formValues.vocalGender === 'instrumental') {
      parts.push('instrumental')
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

  // Clear all form fields
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
      lyricsInput: '',
    })
  }

  // Load default test values
  const loadDefaultValues = () => {
    reset({
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      songTitle: 'My Epic Journey',
      songStyle: 'Rock',
      songMood: 'Energetic',
      vocalGender: 'female',
      tempo: 'medium',
      instruments: ['guitar', 'drums', 'bass'],
      lyricsInput: `[Verse 1]
Standing on the edge of something new
The world is waiting, what will we do
Every moment leads us to the light
We're gonna make it through the night

[Chorus]
We will rise, we will shine
This is our moment, our time
Together we'll reach for the sky
We will rise, we will fly

[Verse 2]
Dreams are calling from beyond the stars
Nothing's gonna stop us, here we are
With every heartbeat, we're alive
Together we will thrive

[Chorus]
We will rise, we will shine
This is our moment, our time
Together we'll reach for the sky
We will rise, we will fly`,
    })
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Select vocal type...</option>
          <option value="male">Male Vocals</option>
          <option value="female">Female Vocals</option>
          <option value="mixed">Mixed/Duet</option>
          <option value="instrumental">Instrumental (No Vocals)</option>
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Guitar</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="piano"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Piano</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="synth"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Synth</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="drums"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Drums</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="strings"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Strings</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="brass"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Brass</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="bass"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Bass</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="electronic"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Electronic</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="orchestral"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Orchestral</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="vocals-only"
              {...register('instruments')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Vocals Only</span>
          </label>
        </div>
        {errors.instruments && (
          <p className="mt-1 text-sm text-red-600">{errors.instruments.message}</p>
        )}
      </div>

      {/* Lyrics Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="lyricsInput" className="block text-sm font-medium text-gray-700">
            Lyrics or Theme <span className="text-red-500">*</span>
          </label>
          {formValues.lyricsInput && (
            <button
              type="button"
              onClick={clearLyrics}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          )}
        </div>
        <textarea
          id="lyricsInput"
          {...register('lyricsInput')}
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          placeholder="Enter your lyrics or describe what you want the song to be about..."
        />
        {errors.lyricsInput && (
          <p className="mt-1 text-sm text-red-600">{errors.lyricsInput.message}</p>
        )}
        <div className="mt-2 text-sm text-gray-500 space-y-1">
          <p>Minimum 10 characters, maximum 2000 characters</p>
          <p className="text-xs">
            <strong>Tip:</strong> Use metatags to structure your song: <code className="bg-gray-100 px-1 rounded">[Intro]</code>, <code className="bg-gray-100 px-1 rounded">[Verse]</code>, <code className="bg-gray-100 px-1 rounded">[Chorus]</code>, <code className="bg-gray-100 px-1 rounded">[Bridge]</code>, <code className="bg-gray-100 px-1 rounded">[Outro]</code>
          </p>
        </div>
      </div>

      {/* Prompt Preview */}
      <div className="border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-3"
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

        {showPrompt && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Style Prompt:</h4>
                <button
                  type="button"
                  onClick={copyStylePrompt}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
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
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
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

            <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 p-3 rounded">
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
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Create My Song - £20'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={loadDefaultValues}
            className="flex items-center justify-center gap-2 bg-white text-green-700 py-2 px-4 rounded-lg font-medium border border-green-300 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
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

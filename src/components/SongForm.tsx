'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { songFormSchema, type SongFormData } from '@/lib/songSchema'
import { useState } from 'react'

export default function SongForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormData>({
    resolver: zodResolver(songFormSchema),
  })

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
        <input
          id="songStyle"
          type="text"
          {...register('songStyle')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Pop, Rock, Country, Jazz"
        />
        {errors.songStyle && (
          <p className="mt-1 text-sm text-red-600">{errors.songStyle.message}</p>
        )}
      </div>

      {/* Song Mood (Optional) */}
      <div>
        <label htmlFor="songMood" className="block text-sm font-medium text-gray-700 mb-1">
          Song Mood <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="songMood"
          type="text"
          {...register('songMood')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Happy, Melancholic, Energetic"
        />
        {errors.songMood && (
          <p className="mt-1 text-sm text-red-600">{errors.songMood.message}</p>
        )}
      </div>

      {/* Lyrics Input */}
      <div>
        <label htmlFor="lyricsInput" className="block text-sm font-medium text-gray-700 mb-1">
          Lyrics or Theme <span className="text-red-500">*</span>
        </label>
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
        <p className="mt-1 text-sm text-gray-500">
          Minimum 10 characters, maximum 2000 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Create My Song - £20'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        You'll be redirected to Stripe to complete your payment
      </p>
    </form>
  )
}

import { Suspense } from 'react'
import Link from 'next/link'

function ThankYouContent({ searchParams }: { searchParams: { order_id?: string } }) {
  const orderId = searchParams.order_id

  if (!orderId) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Not Found
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          We couldn&apos;t find your order. Please check the URL or try submitting the form again.
        </p>

        <Link
          href="/"
          className="inline-block bg-christmas-red text-white px-6 py-3 rounded-lg font-medium hover:bg-christmas-red-dark transition-colors"
        >
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        🎄 Thank You for Your Order! 🎅
      </h1>

      <p className="text-lg text-gray-600 mb-2">
        Your payment has been successfully processed. Your Christmas song is on its way!
      </p>

      <div className="bg-christmas-snow border border-christmas-gold rounded-lg p-6 mb-8 max-w-md mx-auto">
        <p className="text-sm font-medium text-christmas-red-dark mb-1">
          Order ID
        </p>
        <p className="text-xs text-christmas-red font-mono break-all">
          {orderId}
        </p>
      </div>

      <div className="space-y-4 text-left max-w-md mx-auto bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="font-semibold text-gray-900">What happens next?</h2>

        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-snow text-christmas-red flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span>
              We&apos;ll process your order and create your custom song
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-snow text-christmas-red flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span>
              Once ready, you&apos;ll receive an email with download links for MP3, WAV, and lyrics
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-snow text-christmas-red flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span>
              This usually takes 24-48 hours, but we&apos;ll let you know if there are any delays
            </span>
          </li>
        </ol>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        A confirmation email has been sent to your email address.
      </p>

      <Link
        href="/"
        className="inline-block bg-christmas-red text-white px-6 py-3 rounded-lg font-medium hover:bg-christmas-red-dark transition-colors"
      >
        Return to Home
      </Link>
    </div>
  )
}

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-christmas-red mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          }
        >
          <ThankYouContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

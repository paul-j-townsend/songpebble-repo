'use client'
import TestApiButton from "@/components/TestApiButton"

export default function DevPage() {
  return (
    <main className="min-h-screen bg-slate-900 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Development Tools</h1>
        <p className="text-slate-400 mb-8">
          Internal testing and debugging utilities. Not available in production.
        </p>

        <div className="space-y-6">
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">API Testing</h2>
            <TestApiButton />
          </section>
        </div>
      </div>
    </main>
  )
}

import SongForm from "@/components/SongForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            SongPebble
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tell us your story and we&apos;ll turn it into a custom AI-generated song.
          </p>
        </header>

        <SongForm />
      </div>
    </main>
  );
}

import Image from "next/image";
import SongForm from "@/components/SongForm";
import TestApiButton from "@/components/TestApiButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 relative">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 relative z-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/branding/logo-songpebble.png"
              alt="SongPebble logo"
              width={276}
              height={164}
              priority
              className="h-[4.8rem] w-auto"
            />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Tell us your story and we&apos;ll turn it into a custom song!
            </p>
          </div>
        </header>

        <TestApiButton />

        <SongForm />
      </div>
    </main>
  );
}

'use client'

import Image from "next/image";
import SongForm from "@/components/SongForm";
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [isChristmasSeason, setIsChristmasSeason] = useState(false)

  useEffect(() => {
    setIsChristmasSeason(new Date().getMonth() === 11)
  }, [])
  return (
    <main className={`min-h-screen relative ${isChristmasSeason ? "bg-gradient-to-b from-red-900 via-green-900 to-slate-900" : "bg-slate-900"}`}>
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
            {isChristmasSeason ? (
              <h1 className="text-4xl font-bold text-white">
                Create a personalised Christmas song in under a minute
              </h1>
            ) : (
              <h1 className="text-4xl font-bold text-white">
                Create a personalised song for any occasion
              </h1>
            )}
          </div>
        </header>

        <SongForm />
      </div>
    </main>
  );
}

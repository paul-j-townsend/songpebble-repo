'use client'

import { useState, useEffect } from 'react'

export default function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Array<{
    id: number
    left: string
    animationDuration: string
    animationDelay: string
    opacity: number
    fontSize: string
  }>>([])

  // Only generate snowflakes on the client side to avoid hydration mismatch
  useEffect(() => {
    setSnowflakes(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.6 + 0.2,
        fontSize: `${Math.random() * 10 + 10}px`,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white animate-snowfall"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
            fontSize: flake.fontSize,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}

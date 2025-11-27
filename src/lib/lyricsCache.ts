import crypto from 'crypto'
import type { ToCharacter, Sender } from './songSchema'

/**
 * In-memory cache for generated lyrics
 * Reduces Claude API costs by caching identical requests
 */

interface CacheEntry {
  lyrics: string
  provider: 'claude' | 'template'
  timestamp: number
  hits: number
}

// In-memory cache
const cache = new Map<string, CacheEntry>()

// Cache configuration
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 1000 // Maximum entries before LRU eviction

/**
 * Generate cache key from request parameters
 * Hash ensures consistent keys for identical inputs
 */
export function generateCacheKey(
  occasion: string,
  tone: string | undefined,
  toCharacters: ToCharacter[],
  senders: Sender[]
): string {
  const key = `${occasion}|${tone || 'none'}|${JSON.stringify(toCharacters)}|${JSON.stringify(senders)}`
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Get lyrics from cache if available and fresh
 * Returns null if not found or expired
 */
export function getFromCache(cacheKey: string): string | null {
  const entry = cache.get(cacheKey)

  if (!entry) {
    return null
  }

  // Check if expired
  const age = Date.now() - entry.timestamp
  if (age > CACHE_TTL_MS) {
    cache.delete(cacheKey)
    return null
  }

  // Increment hit counter
  entry.hits++

  console.log(`✅ Cache HIT for key ${cacheKey.substring(0, 16)}... (${entry.hits} hits, age: ${Math.round(age / 1000 / 60)} minutes)`)

  return entry.lyrics
}

/**
 * Save lyrics to cache
 * Implements LRU eviction if cache is full
 */
export function saveToCache(
  cacheKey: string,
  lyrics: string,
  provider: 'claude' | 'template'
): void {
  // LRU eviction: Remove oldest entry if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey)
      console.log(`🗑️  Cache eviction: removed oldest entry (${cache.size}/${MAX_CACHE_SIZE})`)
    }
  }

  // Save new entry
  cache.set(cacheKey, {
    lyrics,
    provider,
    timestamp: Date.now(),
    hits: 0,
  })

  console.log(`💾 Cache SAVE for key ${cacheKey.substring(0, 16)}... (provider: ${provider}, cache size: ${cache.size})`)
}

/**
 * Clear old entries (> TTL)
 * Should be called periodically (e.g., every hour)
 */
export function clearOldEntries(): number {
  const now = Date.now()
  let removed = 0

  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > CACHE_TTL_MS) {
      cache.delete(key)
      removed++
    }
  }

  if (removed > 0) {
    console.log(`🧹 Cache cleanup: removed ${removed} expired entries`)
  }

  return removed
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  let totalHits = 0
  let oldestEntry: CacheEntry | null = null
  let newestEntry: CacheEntry | null = null

  for (const entry of cache.values()) {
    totalHits += entry.hits

    if (!oldestEntry || entry.timestamp < oldestEntry.timestamp) {
      oldestEntry = entry
    }
    if (!newestEntry || entry.timestamp > newestEntry.timestamp) {
      newestEntry = entry
    }
  }

  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    totalHits,
    oldestAge: oldestEntry ? Date.now() - oldestEntry.timestamp : 0,
    newestAge: newestEntry ? Date.now() - newestEntry.timestamp : 0,
  }
}

/**
 * Clear entire cache (useful for testing)
 */
export function clearCache(): void {
  cache.clear()
  console.log('🗑️  Cache cleared')
}

// Periodic cleanup (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    clearOldEntries()
  }, 60 * 60 * 1000)
}

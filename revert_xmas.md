# Revert Christmas Branding to Neutral Color Palette

## Overview
Remove all Christmas-specific branding and revert to a professional, neutral color scheme.

## Tailwind Config (tailwind.config.ts)
- [x] Remove christmas color palette (red, green, gold, snow)
- [x] Remove Christmas animations (snowfall, sparkle, pulse-glow, wiggle)
- [x] Add neutral color palette (primary, secondary, accent)

## Pages

### page.tsx (Home)
- [x] Change bg-christmas-snow to bg-gray-50
- [x] Remove Snowfall component import and usage
- [x] Remove sparkle emoji and animation (✨)
- [x] Remove Christmas emojis (🎄, 🎅)
- [x] Change text-christmas-red-dark to text-gray-700
- [x] Update tagline from Christmas-specific to generic

### thank-you/page.tsx
- [x] Change bg-christmas-snow to bg-gray-50
- [x] Replace christmas-red with blue-600/red-600
- [x] Replace christmas-green with green-600
- [x] Replace christmas-gold with gray-200
- [x] Remove Christmas emojis (🎄, 🎅)
- [x] Update messaging from "Christmas song" to "custom song"
- [x] Change border colors to neutral grays
- [x] Update step indicator colors to neutral palette

## Components

### Snowfall.tsx
- [x] Delete component entirely or disable rendering

### SongForm.tsx
- [x] Replace christmas-gold focus rings with blue-500
- [x] Replace christmas-red buttons with blue-600
- [x] Replace christmas-green with green-600 or gray-700
- [x] Replace christmas-snow backgrounds with gray-50/white
- [x] Replace christmas-gold-light borders with gray-200
- [x] Update all christmas color references to neutral equivalents
- [x] Change focus:ring-christmas-gold to focus:ring-blue-500
- [x] Update hover states from christmas colors to neutral

### TestApiButton.tsx
- [x] Check and replace any christmas color references

## Default Form Values
- [x] Update default test data to remove Christmas context
- [x] Change email from santa@northpole.com to generic
- [x] Change name from Christmas-themed to generic
- [x] Change song title from Christmas-themed to generic
- [x] Update test lyrics to remove Christmas content
- [x] Update character interests from Christmas to generic

## Library Functions (src/lib)

### promptGenerator.ts
- [x] Rename buildChristmasStyle to buildSongStyle
- [x] Rename generateChristmasPrompt to generateSongPrompt
- [x] Remove "Christmas" prefix from style tags
- [x] Remove Christmas-specific sonic elements (bells, chimes, etc.)
- [x] Update prompt template to generic messaging
- [x] Change default sender from "Santa" to "Your Friends"
- [x] Replace "Merry Christmas" with generic celebration text

### generateSong.ts
- [x] Update imports to use renamed functions
- [x] Update function calls to use buildSongStyle and generateSongPrompt
- [x] Update comments to remove Christmas references

## Progress Tracking
Started: 2025-11-26
Completed: 2025-11-26

## Summary
All Christmas branding has been successfully removed and replaced with a neutral color palette:

### Visual Changes
- Removed Christmas color theme from Tailwind config (red, green, gold, snow)
- Removed Christmas animations (snowfall, sparkle, pulse-glow, wiggle)
- Updated all pages (home, thank-you) to use neutral colors
- Disabled Snowfall component
- Replaced all Christmas colors in components with neutral alternatives
- Removed Christmas emojis (🎄, 🎅, ✨)

### Functional Changes
- Renamed `buildChristmasStyle` → `buildSongStyle`
- Renamed `generateChristmasPrompt` → `generateSongPrompt`
- Removed Christmas-specific sonic elements from style builder
- Updated song prompt template to generic celebration messaging
- Changed default sender from "Santa" to "Your Friends"
- Updated default form values and test data to remove Christmas context

### Color Mapping Applied
- christmas-red → blue-600 (primary) / red-600 (errors)
- christmas-green → gray-700 (text) / green-600 (success)
- christmas-gold → blue-500 (focus) / gray-300 (borders)
- christmas-snow → gray-50 (backgrounds)

### Files Modified
- tailwind.config.ts
- src/app/page.tsx
- src/app/thank-you/page.tsx
- src/components/Snowfall.tsx
- src/components/SongForm.tsx
- src/components/TestApiButton.tsx
- src/lib/promptGenerator.ts
- src/lib/generateSong.ts

---

## Color Mapping Reference
Replace Christmas colors with these neutrals:
- `christmas-red` → `blue-600` (primary actions) or `red-600` (errors)
- `christmas-red-dark` → `blue-700` or `red-700`
- `christmas-green` → `gray-700` (text) or `green-600` (success)
- `christmas-green-dark` → `gray-800` or `green-700`
- `christmas-gold` → `blue-500` (focus) or `amber-500` (accent)
- `christmas-gold-light` → `gray-200` (borders)
- `christmas-snow` → `gray-50` (backgrounds)

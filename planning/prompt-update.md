# SongPebble Safe Mode Implementation Plan

## Overview
Update the UI and prompt generation to align with the new "Safe Mode" occasion-based system defined in `SongPebble Safe Mode.yaml`.

---

## Gap Analysis

### Current State
- ✅ Occasion field exists with enum: `['christmas', 'birthday', 'anniversary', 'other']`
- ❌ Occasions don't match Safe Mode spec: needs `['christmas', 'birthday', 'leaving-gift', 'roast', 'pets', 'kids']`
- ❌ No tone field (funny, sweet, epic, rude, emotional)
- ❌ Current prompt generator is generic, not occasion-specific
- ❌ No character limits enforced per occasion type
- ❌ No validation for Birthday/Leaving gift = 1 character only rule

### Safe Mode Requirements
- 6 distinct occasions with specific musical styles and structures
- Tone selection (funny, sweet, epic, rude, kids, emotional)
- Occasion-specific character limits
- Strict section formatting per occasion
- Character count limit: 2500 characters
- Multi-character rules (1 verse per character)
- Birthday/Leaving gift must have exactly 1 character

---

## Implementation Tasks

### Phase 1: Schema & Type Updates

#### [ ] Update `src/lib/songSchema.ts`
- [ ] Change occasion enum from `['christmas', 'birthday', 'anniversary', 'other']` to `['christmas', 'birthday', 'leaving-gift', 'roast', 'pets', 'kids']`
- [ ] Add new `tone` field with enum `['funny', 'sweet', 'epic', 'rude', 'emotional']` (optional)
- [ ] Add dynamic validation: if occasion is 'birthday' or 'leaving-gift', require exactly 1 toCharacter
- [ ] Add validation: max 6 toCharacters for christmas/roast, max 4 for pets/kids
- [ ] Update TypeScript types to include tone

#### [ ] Update database migration
- [ ] Create new migration `10_update_occasion_and_add_tone.sql`
- [ ] Update occasion constraint to new values
- [ ] Add tone column (TEXT, nullable)
- [ ] Add check constraint for tone values

---

### Phase 2: UI Updates

#### [ ] Update `src/components/SongForm.tsx` - Occasion Selector
- [ ] Replace occasion options:
  - Remove: 'anniversary', 'other'
  - Add: 'leaving-gift', 'roast', 'pets', 'kids'
- [ ] Update option labels:
  - `christmas` → "Christmas"
  - `birthday` → "Birthday"
  - `leaving-gift` → "Leaving Gift"
  - `roast` → "Roast"
  - `pets` → "Pets"
  - `kids` → "Kids"

#### [ ] Add Tone Selector to `src/components/SongForm.tsx`
- [ ] Add tone dropdown field after occasion selector
- [ ] Options: Funny, Sweet, Epic, Rude, Emotional
- [ ] Make it optional
- [ ] Add help text: "Choose the mood and style of your song"

#### [ ] Add Dynamic Character Limits
- [ ] Watch occasion field value
- [ ] Dynamically update "Add Recipient" button state:
  - Christmas/Roast: max 6 characters
  - Birthday/Leaving Gift: max 1 character
  - Pets/Kids: max 4 characters
- [ ] Update counter display: `{toCharacterFields.length}/{maxForOccasion}`
- [ ] Add validation message if user tries to exceed limits

#### [ ] Update Labels Based on Occasion
- [ ] "To" section label should adapt:
  - Default: "Recipients"
  - Pets: "Your Pets"
  - Kids: "Children"
  - Birthday: "Birthday Person"
  - Leaving Gift: "Leaving Colleague"
- [ ] Add occasion-specific help text

---

### Phase 3: Prompt Generator Updates

#### [ ] Create new `src/lib/safeMode/` directory
- [ ] Create `types.ts` - shared types for Safe Mode
- [ ] Create `christmas.ts` - Christmas-specific prompt generator
- [ ] Create `birthday.ts` - Birthday-specific prompt generator
- [ ] Create `leavingGift.ts` - Leaving gift-specific prompt generator
- [ ] Create `roast.ts` - Roast-specific prompt generator
- [ ] Create `pets.ts` - Pets-specific prompt generator
- [ ] Create `kids.ts` - Kids-specific prompt generator
- [ ] Create `index.ts` - main Safe Mode generator that routes to occasion-specific generators

#### [ ] Implement Christmas Generator (`christmas.ts`)
- [ ] Music tag: `[Music: 110 BPM, folk rock, acoustic guitar, bells, warm harmonies]`
- [ ] INTRO with bells ringing (max 2-3 lines)
- [ ] One VERSE per character (max 6) with tags: upbeat, cheerful, joyful, warm, bright, happy
- [ ] CHORUS with cheering, group vocals (max 4-5 lines)
- [ ] OUTRO with bells, "Merry Christmas and a happy new year" (max 2-3 lines)
- [ ] Include fromNames in outro
- [ ] Mention Christmas, warmth, bells, snow

#### [ ] Implement Birthday Generator (`birthday.ts`)
- [ ] Music tag: `[Music: 130 BPM, pop rock, upbeat drums, crowd cheering]`
- [ ] INTRO with fireworks (max 2-3 lines)
- [ ] VERSE 1 upbeat (max 4 lines)
- [ ] CHORUS with cheering, group vocals (max 4-5 lines)
- [ ] OUTRO with celebration, clapping (max 2-3 lines)
- [ ] Mention birthday person's name at least 3 times throughout
- [ ] Include fromNames in outro
- [ ] Validate: exactly 1 character

#### [ ] Implement Leaving Gift Generator (`leavingGift.ts`)
- [ ] Music tag: `[Music: 85 BPM, soft rock ballad, piano, strings, gentle harmonies]`
- [ ] INTRO soft (max 2-3 lines)
- [ ] VERSE 1 warm, emotional (max 4 lines)
- [ ] CHORUS heartfelt, harmony (max 4-5 lines)
- [ ] OUTRO gentle, fade out (max 2-3 lines)
- [ ] Mention leaving person's name at least 3 times
- [ ] Include memories and well wishes
- [ ] Include fromNames in outro
- [ ] Validate: exactly 1 character

#### [ ] Implement Roast Generator (`roast.ts`)
- [ ] Music tag: `[Music: 125 BPM, rock, electric guitar, playful energy]`
- [ ] INTRO playful (max 2-3 lines)
- [ ] One VERSE per character (max 6) with tags: cheeky, teasing, playful, silly, light, funny
- [ ] CHORUS with laughing, group vocals (max 4-5 lines)
- [ ] OUTRO friendly, laugh (max 2-3 lines)
- [ ] Simple, light teasing only (safe words)
- [ ] Include fromNames in outro

#### [ ] Implement Pets Generator (`pets.ts`)
- [ ] Music tag: `[Music: 105 BPM, indie pop, ukulele, playful, light harmonies]`
- [ ] INTRO playful, cute (max 2-3 lines)
- [ ] One VERSE per pet (max 4) with tags: cute/sweet voice, adorable, playful, sweet
- [ ] CHORUS sweet, warm (max 4-5 lines)
- [ ] OUTRO gentle, hum (max 2-3 lines)
- [ ] Describe pet behavior cutely
- [ ] Include fromNames in outro

#### [ ] Implement Kids Generator (`kids.ts`)
- [ ] Music tag: `[Music: 145 BPM, bouncy pop, fun instruments, playful voices]`
- [ ] INTRO bouncy, excited (max 2-3 lines)
- [ ] One VERSE per character (max 4) with tags: silly/energetic, fun, playful, happy
- [ ] CHORUS energetic, group singing (max 4-5 lines)
- [ ] OUTRO happy, playful (max 2-3 lines)
- [ ] Very simple, imaginative, no sarcasm
- [ ] Include fromNames in outro

#### [ ] Create Safe Mode Generator Router (`index.ts`)
- [ ] Export `generateSafeModePrompt(occasion, tone, data)` function
- [ ] Route to correct generator based on occasion
- [ ] Apply tone modifications to all generators
- [ ] Enforce global constraints:
  - No emojis, parentheses, special characters
  - No brackets except section headers
  - No slang or complex metaphors
  - Simple, clean, easy to sing language
  - International English (no Americanisms)
  - Avoid archaic/formal words (kin, folk, thee, beloved, etc.)
  - Max 2500 characters total

#### [ ] Update `src/lib/promptGenerator.ts`
- [ ] Update `generatePrompt()` function to use Safe Mode generators
- [ ] Add tone parameter
- [ ] Route to `generateSafeModePrompt()` for all occasions
- [ ] Keep backward compatibility if needed

---

### Phase 4: Backend Updates

#### [ ] Update `src/app/api/create-order/route.ts`
- [ ] Save tone field to database
- [ ] Validate occasion-specific character limits server-side
- [ ] Return appropriate errors if validation fails

---

### Phase 5: Testing & Validation

#### [ ] Test Each Occasion Type
- [ ] Christmas: Test with 1-6 characters, verify verse structure
- [ ] Birthday: Test with 1 character, verify name mentioned 3x
- [ ] Leaving Gift: Test with 1 character, verify name mentioned 3x
- [ ] Roast: Test with 1-6 characters, verify playful tone
- [ ] Pets: Test with 1-4 pets, verify cute descriptions
- [ ] Kids: Test with 1-4 kids, verify simple language

#### [ ] Test Tone Variations
- [ ] Test each occasion with all applicable tones
- [ ] Verify tone affects language style appropriately

#### [ ] Validate Constraints
- [ ] Verify 2500 character limit enforced
- [ ] Verify no emojis, parentheses, or special characters
- [ ] Verify international English (no Americanisms)
- [ ] Verify no archaic words
- [ ] Verify line limits per section

#### [ ] Test UI Behavior
- [ ] Verify dynamic character limits work
- [ ] Verify Birthday/Leaving Gift blocks adding >1 character
- [ ] Verify occasion-specific labels display correctly
- [ ] Verify tone selector appears and works

#### [ ] TypeScript & Build
- [ ] Run `npx tsc --noEmit` - verify no errors
- [ ] Run `npm run build` - verify successful build

---

### Phase 6: Database Migration

#### [ ] Apply Migration
- [ ] Run `npx supabase db push` to apply new migration
- [ ] Verify occasion constraint updated
- [ ] Verify tone column added
- [ ] Test inserting orders with new occasion values

---

## Migration Strategy

### Option A: Update Existing Orders (Recommended)
```sql
-- Map old values to new values
UPDATE orders
SET occasion = CASE
  WHEN occasion = 'anniversary' THEN 'leaving-gift'
  WHEN occasion = 'other' THEN 'birthday'
  ELSE occasion
END;
```

### Option B: Leave Existing Orders Unchanged
- Add migration that allows both old and new values temporarily
- Phase out old values over time
- Update constraint after all old orders processed

---

## Rollout Checklist

- [ ] All schema changes committed
- [ ] All UI changes committed
- [ ] All prompt generators implemented
- [ ] All tests passing
- [ ] Database migration written
- [ ] Migration tested locally
- [ ] Documentation updated
- [ ] Safe Mode YAML rules verified against implementation

---

## Notes

### Character Limits Per Occasion
| Occasion | Min Characters | Max Characters |
|----------|---------------|----------------|
| Christmas | 1 | 6 |
| Birthday | 1 | 1 |
| Leaving Gift | 1 | 1 |
| Roast | 1 | 6 |
| Pets | 1 | 4 |
| Kids | 1 | 4 |

### Forbidden Words (Archaic/Formal)
kin, folk, thee, thy, beloved, cherished, brethren, jubilation, farewell, endeavor, alas, behold, whilst, companion, festive, rejoice, glory, splendor, hearth, abode, dandy, fine, grand

### Forbidden Americanisms
candy, sidewalk, truck, vacation, apartment, elevator, mom, diaper, cookie, trash, fall (season), soccer

### Section Line Limits
- INTRO: 2-3 lines
- VERSE: 4 lines each
- CHORUS: 4-5 lines
- OUTRO: 2-3 lines

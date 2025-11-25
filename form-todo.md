# Form Improvements Todo - Suno AI Optimization

## Overview
Enhance the SongForm to capture essential Suno AI parameters for better music generation quality.

---

## Phase 1: High Priority Fields (Current Focus)

### 1. Vocal Gender/Type Field
- [x] Add `vocal_gender` to Zod schema (src/lib/songSchema.ts)
- [x] Add vocal gender dropdown to form UI (src/components/SongForm.tsx)
- [x] Add `vocal_gender` column to database (migration SQL)
- [x] Update API route to handle vocal_gender field
- [ ] Test form submission with vocal gender
- **Options:** Male / Female / Mixed / Instrumental
- **Impact:** HIGH - Maps directly to Suno API parameter

### 2. Tempo/BPM Field
- [x] Add `tempo` to Zod schema
- [x] Add tempo dropdown to form UI
- [x] Add `tempo` column to database
- [x] Update API route to handle tempo field
- [ ] Test form submission with tempo
- **Options:** Slow (60-80 BPM) / Medium (90-120 BPM) / Fast (130-160 BPM) / Very Fast (160+ BPM)
- **Impact:** HIGH - Critical for genre accuracy

### 3. Key Instruments Field
- [x] Add `instruments` to Zod schema (array validation)
- [x] Add instruments multi-select to form UI
- [x] Add `instruments` JSONB column to database
- [x] Update API route to handle instruments array
- [ ] Test form submission with multiple instruments
- **Options:** Guitar, Piano, Synth, Drums, Strings, Brass, Bass, Electronic, Orchestral, Vocals Only
- **Impact:** HIGH - One of 4 core Suno prompt elements

### 4. Database Migration
- [x] Create new SQL migration file (supabase/06_add_suno_fields.sql)
- [x] Add all Phase 1 columns to orders table
- [ ] Test migration on local Supabase
- [ ] Run migration on production database

### 5. Help Text for Lyrics/Metatags
- [x] Add examples of Suno metatags to lyrics field help text
- [x] Show sample structure: [Intro], [Verse], [Chorus], etc.
- [ ] Add link to metatags guide or tooltip (future enhancement)
- **Impact:** MEDIUM - Helps users structure lyrics better

### 6. Show Prompt Preview Feature
- [x] Add "Preview Suno AI Prompt" button to form
- [x] Create buildSunoPrompt() function to generate preview
- [x] Display style prompt with character count
- [x] Display lyrics/theme section
- [x] Show helpful note about prompt usage
- **Impact:** HIGH - Users can see exactly what will be sent to Suno

---

## Phase 2: Medium Priority Fields (Next)

### 6. Vocal Style Field
- [ ] Add `vocal_style` to Zod schema
- [ ] Add vocal style dropdown to form UI
- [ ] Add `vocal_style` column to database
- [ ] Update API route to handle vocal_style
- [ ] Test form submission
- **Options:** Powerful / Soft / Raspy / Smooth / Breathy / Aggressive / Natural
- **Impact:** MEDIUM - Refines vocal delivery

### 7. Musical Key Field
- [ ] Add `musical_key` to Zod schema
- [ ] Add musical key dropdown to form UI
- [ ] Add `musical_key` column to database
- [ ] Update API route to handle musical_key
- [ ] Test form submission
- **Options:** C Major, D Minor, E Major, etc. + "Any" option
- **Impact:** MEDIUM - Important for harmonic context

### 8. Song Length Field
- [ ] Add `song_length` to Zod schema
- [ ] Add song length dropdown to form UI
- [ ] Add `song_length` column to database
- [ ] Update API route to handle song_length
- [ ] Test form submission
- **Options:** Short (~1 min) / Standard (~2 min) / Extended (~3+ min)
- **Impact:** MEDIUM - Sets generation expectations

### 9. Style Reference Field
- [ ] Add `style_reference` to Zod schema
- [ ] Add style reference text input to form UI
- [ ] Add `style_reference` column to database
- [ ] Update API route to handle style_reference
- [ ] Test form submission
- **Format:** "Sounds like [artist/band name]"
- **Impact:** MEDIUM - Suno anchors well to style references

---

## Phase 3: Nice-to-Have Enhancements (Future)

### 10. Production Style Field
- [ ] Add `production_style` to schema
- [ ] Add production style dropdown
- [ ] Add database column
- **Options:** Lo-fi / Polished / Raw / Ambient / Vintage / Modern
- **Impact:** LOW

### 11. Time Signature Field
- [ ] Add `time_signature` to schema
- [ ] Add time signature dropdown
- [ ] Add database column
- **Options:** 4/4 / 3/4 / 6/8 / 5/4 / Other
- **Impact:** LOW

### 12. Advanced Metatag Helper
- [ ] Create interactive metatag builder
- [ ] Add visual song structure editor
- [ ] Generate metatags automatically from structure
- **Impact:** LOW - Nice UX improvement

---

## Database Schema Updates Needed

```sql
-- Phase 1 columns
ALTER TABLE orders ADD COLUMN vocal_gender TEXT;
ALTER TABLE orders ADD COLUMN tempo TEXT;
ALTER TABLE orders ADD COLUMN instruments JSONB;

-- Phase 2 columns
ALTER TABLE orders ADD COLUMN vocal_style TEXT;
ALTER TABLE orders ADD COLUMN musical_key TEXT;
ALTER TABLE orders ADD COLUMN song_length TEXT;
ALTER TABLE orders ADD COLUMN style_reference TEXT;

-- Phase 3 columns (future)
ALTER TABLE orders ADD COLUMN production_style TEXT;
ALTER TABLE orders ADD COLUMN time_signature TEXT;
```

---

## Testing Checklist

### After Phase 1 Completion
- [ ] Form loads without errors
- [ ] All new dropdowns populate correctly
- [ ] Multi-select instruments works properly
- [ ] Form validation works for new fields
- [ ] Data saves correctly to Supabase
- [ ] API receives all new fields
- [ ] Order creation includes new data
- [ ] Existing orders still work (backward compatibility)

### After Phase 2 Completion
- [ ] All medium priority fields working
- [ ] No conflicts between fields
- [ ] Form UX is smooth and intuitive
- [ ] Database stores all data correctly
- [ ] Ready for Suno prompt building logic

---

## Prompt Building Logic (Phase 2 Automation)

Once all fields are captured, build Suno prompts like this:

**Style Prompt (max 200 chars):**
```
[songStyle] with [vocal_gender] vocals, [songMood] mood, featuring [instruments.join(', ')], [tempo], in [musical_key], [vocal_style] delivery, [style_reference]
```

**Example Output:**
```
"Indie Rock with female vocals, melancholic mood, featuring guitar, piano, and strings, medium tempo (100 BPM), in D minor, soft vocal delivery, sounds like Phoebe Bridgers"
```

**Lyrics with Structure:**
- Parse user's lyrics
- Add metatags if not present
- Format for Suno Custom Mode

---

## Progress Summary

### Completed
- [x] Research Suno AI prompt requirements
- [x] Identify missing form fields
- [x] Create form-todo.md tracker
- [x] Plan implementation phases
- [x] Add vocal_gender, tempo, and instruments to Zod schema
- [x] Add all Phase 1 fields to form UI
- [x] Update API route to handle new fields
- [x] Create database migration SQL file
- [x] Add metatags help text to lyrics field
- [x] Add "Preview Suno AI Prompt" feature with real-time preview
- [x] Fix Stripe API version issue
- [x] Fix ESLint issues
- [x] Verify build succeeds

### In Progress
- [ ] Test Phase 1 fields in browser
- [ ] Run database migration in Supabase

### Not Started
- [ ] Phase 2: Medium priority fields
- [ ] Phase 3: Nice-to-have enhancements
- [ ] Backend Suno prompt builder for automation (Phase 2)

---

**Last Updated:** 2025-11-25 01:20 GMT
**Current Phase:** Phase 1 - High Priority Fields (100% Complete)
**Next Milestone:** Test form and run database migration
**Status:** ✅ All Phase 1 features implemented and building successfully!

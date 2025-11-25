# SongPebble Code Changes Report

**Date:** November 25, 2025
**Branch:** box
**Scope:** API.box Integration & Christmas Theming

---

## Executive Summary

This report documents a major feature addition to the SongPebble application: integration with API.box for automated song generation, along with Christmas-themed UI enhancements. The changes establish a complete end-to-end workflow from payment to song delivery.

---

## 1. Core Integration: API.box Music Generation

### 1.1 New Song Generation Library (`src/lib/generateSong.ts`)

**Purpose:** Centralized song generation logic for API.box integration

**Key Features:**
- `generateSongForOrder()` function handles complete song generation workflow
- Validates order status (must be 'paid')
- Builds prompts from order details (style, mood, tempo, instruments)
- Sends requests to API.box V4_5 model
- Updates order status to 'processing'
- Includes webhook callback URL with orderId parameter

**Smart URL Handling:**
```typescript
// Priority: NGROK_URL > BASE_URL > NEXT_PUBLIC_BASE_URL > localhost
const baseUrl = process.env.NGROK_URL || process.env.BASE_URL ||
                process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
```

**Prompt Building:**
- Combines lyrics input with style, mood, tempo, and instruments
- Creates comprehensive prompts for AI music generation
- Maps tempo values (slow/medium/fast/very-fast) to descriptive text

### 1.2 Stripe Webhook Enhancement (`src/app/api/stripe-webhook/route.ts`)

**Changes:**
- Automatically triggers song generation after successful payment
- Imports and calls `generateSongForOrder()`
- Handles generation failures gracefully without breaking payment flow
- Logs task IDs for tracking
- Updates order to 'failed' if generation can't start

**Error Handling Strategy:**
```typescript
// Payment success is independent of generation
// Failed generation is logged but doesn't break the webhook
try {
  await generateSongForOrder(orderId)
} catch (error) {
  console.error('Error triggering song generation:', error)
  // Order remains 'paid', can retry generation later
}
```

---

## 2. Webhook System for Song Delivery

### 2.1 API.box Webhook Handler (`src/app/api/box-webhook/route.ts`)

**Purpose:** Receives callbacks from API.box when songs are ready

**Workflow:**
1. Receives webhook with taskId, status, downloadUrl, lyricsUrl
2. Extracts orderId from query params or request body
3. Downloads generated song from API.box
4. Uploads to Supabase Storage (tracks bucket)
5. Downloads and stores lyrics if available (lyrics bucket)
6. Updates order with file paths and 'delivered' status

**Storage Organization:**
- Songs: `tracks/{orderId}/song.{mp3|wav}`
- Lyrics: `lyrics/{orderId}/lyrics.txt`

**Comprehensive Logging:**
- 22+ console.log statements throughout the process
- Step-by-step progress tracking
- Emoji-prefixed logs for easy scanning (🎵 📋 ✅ ❌ ⚠️)

**Error Scenarios Handled:**
- Missing taskId or orderId
- Order not found in database
- Download failures
- Storage upload failures
- Failed generation status from API.box

### 2.2 Test API Endpoint (`src/app/api/test-box-api/route.ts`)

**Purpose:** Development tool to test API.box integration

**Features:**
- Creates test order in database
- Sends test request to API.box
- Uses configurable webhook URL (ngrok support)
- Extensive logging for debugging
- Returns taskId and orderId for tracking

**Test Payload:**
```typescript
{
  customMode: true,
  instrumental: false,
  model: 'V4_5',
  callBackUrl: `${baseUrl}/api/box-webhook?orderId=${testOrder.id}`,
  prompt: 'A joyful indie pop song...',
  style: 'Indie Pop',
  title: 'Test Song Generation - Dummy Track'
}
```

---

## 3. UI/UX Enhancements

### 3.1 Christmas Theming

**Tailwind Config Updates (`tailwind.config.ts`):**

New Color Palette:
- **Christmas Red:** #C41E3A (default), #DC143C (light), #8B0000 (dark)
- **Christmas Green:** #165B33 (default), #2D8659 (light), #0B4025 (dark)
- **Christmas Gold:** #FFD700 (default), #FFE44D (light), #DAA520 (dark)
- **Christmas Snow:** #F8FAFC (default), #FFFFFF (light), #E2E8F0 (dark)

**New Animations:**
```typescript
keyframes: {
  snowfall: { '0%': {...}, '100%': {...} },
  sparkle: { '0%, 100%': { opacity: '0' }, '50%': { opacity: '1' } }
}
```

### 3.2 Snowfall Component (`src/components/Snowfall.tsx`)

**Features:**
- 30 animated snowflakes
- Random positioning, duration (5-8s), delay (0-5s)
- Variable opacity (0.2-0.8) and size (10-20px)
- Client-side only rendering to prevent hydration issues
- Fixed positioning, pointer-events-none for non-interference

**Technical Approach:**
```typescript
// Avoid hydration mismatch
useEffect(() => {
  setSnowflakes(Array.from({ length: 30 }, ...))
}, [])
```

### 3.3 Test API Button (`src/components/TestApiButton.tsx`)

**Purpose:** Development tool for testing API.box integration

**Features:**
- Calls `/api/test-box-api` endpoint
- Shows loading state during API calls
- Displays success/error results with color-coded styling
- Shows taskId when successful
- Handles 429 (insufficient credits) specifically
- Extensive console logging for debugging

### 3.4 Main Page Updates (`src/app/page.tsx`)

**Changes:**
- Added Snowfall component
- Added TestApiButton component (development only)
- Christmas-themed messaging: "Ho ho ho!"
- Sparkle emoji animation (✨)
- Christmas emojis (🎄 🎅)
- Updated copy: "custom Christmas song"

### 3.5 SongForm Updates (`src/components/SongForm.tsx`)

**Color Scheme Changes:**
- All blue colors → Christmas red (#C41E3A)
- Focus rings → Christmas gold (#FFD700)
- Green buttons → Christmas green (#165B33)
- Background highlights → Christmas snow (#F8FAFC)

**Button Updates:**
- Submit: Christmas red with dark red hover
- Add Recipient: Christmas red
- Add Sender: Christmas green
- Test buttons: Christmas green

**Visual Consistency:**
- Checkboxes use Christmas colors
- Dropdown selects use gold focus rings
- Copy buttons use Christmas red
- All transitions maintain Christmas theme

### 3.6 Thank You Page (`src/app/thank-you/page.tsx`)

**Updates:**
- Christmas emoji headers: 🎄 🎅
- "Your Christmas song is on its way!"
- Christmas color scheme throughout
- Snow-themed info boxes
- Christmas red/gold accents

### 3.7 Layout Fix (`src/app/layout.tsx`)

**Change:**
```tsx
<body suppressHydrationWarning>{children}</body>
```

**Purpose:** Prevents hydration warnings from client-side snowfall component

---

## 4. Documentation Files

### 4.1 New Documentation

1. **api-box.md** (6,445 bytes)
   - Complete API.box platform documentation
   - API endpoints and parameters
   - Webhook structure and usage
   - Authentication details
   - Model versions (V3_5, V4, V4_5, V4_5PLUS, V5)
   - Use cases and best practices

2. **NGROK_SETUP.md** (2,548 bytes)
   - Instructions for setting up ngrok
   - Required for local webhook testing
   - Configuration steps
   - Environment variable setup

3. **NGROK_AUTH_SETUP.md** (1,504 bytes)
   - Ngrok authentication process
   - API token configuration
   - Account setup instructions

4. **MANUAL_WEBHOOK_TEST.md** (2,136 bytes)
   - Manual testing procedures
   - Webhook payload examples
   - curl commands for testing
   - Troubleshooting guide

### 4.2 Supporting Files

- **start-ngrok.sh** - Script to start ngrok tunnel
- **test-api-box.mjs** - Node.js test script for API.box
- **.env.local.bak** - Backup of environment variables

---

## 5. Technical Architecture

### 5.1 End-to-End Flow

```
1. User fills form → Submit
2. Frontend → /api/create-order → Creates order in DB
3. Order → Stripe Checkout
4. Payment success → Stripe webhook → /api/stripe-webhook
5. Webhook marks order 'paid' → Calls generateSongForOrder()
6. generateSongForOrder() → API.box /api/v1/generate
7. API.box queues task → Returns taskId
8. Order status → 'processing'
9. API.box completes → Webhook → /api/box-webhook?orderId={id}
10. box-webhook downloads song → Uploads to Supabase Storage
11. Order updated with file paths → Status 'delivered'
12. User receives song
```

### 5.2 Environment Variables Required

```env
# API.box
API_BOX_KEY=your_api_key_here

# Webhook URL (for local development)
NGROK_URL=https://xxxx.ngrok-free.app

# Or production
BASE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Existing
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 5.3 Database Schema (No Changes)

Orders table already has required fields:
- `mp3_url` (text) - Stores path to MP3 in Supabase Storage
- `wav_url` (text) - Stores path to WAV in Supabase Storage
- `lyrics_url` (text) - Stores path to lyrics
- `delivered_at` (timestamptz) - Timestamp when song was delivered

### 5.4 Supabase Storage Buckets

**Required Buckets:**
1. **tracks** - Stores MP3/WAV files
2. **lyrics** - Stores lyrics text files

**Bucket Configuration:**
- Public access required for download links
- File size limits appropriate for audio files
- Organized by order ID for easy retrieval

---

## 6. Error Handling & Logging

### 6.1 Comprehensive Logging Strategy

**Log Levels:**
- 🎵 - Main entry points (webhook received, test started)
- 📋 - Step-by-step progress
- ✅ - Successful operations
- ❌ - Errors and failures
- ⚠️ - Warnings (localhost URLs, missing data)
- ℹ️ - Informational messages

**Example from box-webhook:**
```typescript
console.log('🎵 [WEBHOOK] Received API.box webhook callback')
console.log('📋 [WEBHOOK] Step 1: Parsing webhook payload...')
console.log('✅ [WEBHOOK] Order found:', { id: order.id, status: order.status })
```

### 6.2 Error Recovery

**Stripe Webhook:**
- Song generation failure doesn't break payment flow
- Order remains 'paid' for manual retry

**Box Webhook:**
- Download failures mark order as 'failed'
- Lyrics download failures don't break main flow
- Missing orderId returns clear error message

**Test Endpoint:**
- Creates test order for complete flow testing
- Handles API errors with detailed feedback
- Shows specific messages for 429 (insufficient credits)

---

## 7. Development & Testing Tools

### 7.1 TestApiButton Component

**Usage:** Add to any page during development

**Benefits:**
- Quick API.box integration testing
- No need for full payment flow
- Visual feedback on success/failure
- Console logging for debugging

### 7.2 Test API Endpoint

**Endpoint:** `POST /api/test-box-api`

**Creates:**
- Test order in database (marked as 'paid')
- Real API.box request
- Webhook callback with orderId

**Use Cases:**
- Verify API.box credentials
- Test webhook connectivity
- Debug song generation issues
- Validate storage integration

### 7.3 Ngrok Integration

**Purpose:** Expose localhost for webhook testing

**Setup:**
1. Install ngrok
2. Run `./start-ngrok.sh`
3. Copy ngrok URL to `.env.local` as `NGROK_URL`
4. Webhooks now reach local development server

**Benefits:**
- Test complete flow locally
- Debug webhook handling
- No need for staging environment

---

## 8. Code Quality & Best Practices

### 8.1 TypeScript Usage

**Strong Typing:**
```typescript
export async function generateSongForOrder(orderId: string): Promise<{
  success: boolean
  taskId?: string
  error?: string
}>
```

**Function Signatures:**
- Clear input/output types
- Optional parameters marked correctly
- Record types for mappings

### 8.2 Error Handling Patterns

**Try-Catch Blocks:**
- All async operations wrapped
- Specific error messages
- Fallback values when appropriate

**Error Response Format:**
```typescript
return {
  success: false,
  error: 'Descriptive error message',
  details: additionalInfo // when available
}
```

### 8.3 Separation of Concerns

**generateSong.ts:**
- Single responsibility: song generation
- Helper function for prompt building
- No UI logic

**Webhook Routes:**
- Handle one type of webhook each
- Clear step-by-step flow
- Delegated storage logic to helper function

### 8.4 Configuration Management

**Environment-Based:**
- API keys from env vars
- URLs configurable per environment
- Smart defaults with warnings

**Model Selection:**
- V4_5 chosen for balance of quality/speed
- Easy to change in one place
- Documented in code comments

---

## 9. Security Considerations

### 9.1 API Key Protection

**Current Implementation:**
- API_BOX_KEY in environment variables
- Never exposed to client-side
- Server-side only usage

### 9.2 Webhook Validation

**Current State:**
- No signature validation on API.box webhooks
- Relies on orderId validation

**Recommendation:**
- Add webhook signature verification if API.box provides it
- Validate taskId matches expected format

### 9.3 Storage Access

**Supabase Buckets:**
- Public read access for downloads
- Server-side write access only
- Files organized by orderId

---

## 10. Performance Considerations

### 10.1 Async Operations

**generateSongForOrder:**
- Non-blocking API calls
- Doesn't wait for song completion
- Returns taskId immediately

**Webhook Handler:**
- Downloads and uploads happen asynchronously
- Order updated after successful storage
- Failed uploads don't leave orphaned files

### 10.2 Streaming & Timeouts

**API.box V4_5:**
- Supports streaming responses
- ~20 second initial output
- Up to 8 minutes song duration

**Next.js Routes:**
- Default timeouts may need adjustment for large files
- Consider streaming for download endpoints

---

## 11. Future Enhancements

### 11.1 Potential Improvements

1. **Email Notifications:**
   - Send email when song is ready
   - Include download links
   - Use delivered_at timestamp

2. **Progress Tracking:**
   - Poll API.box for task status
   - Show progress bar to users
   - Real-time updates via WebSockets

3. **Retry Mechanism:**
   - Automatic retry for failed generations
   - Manual retry button in admin
   - Queue system for bulk processing

4. **Model Selection:**
   - Allow users to choose model version
   - Different pricing tiers
   - Quality vs speed options

5. **Advanced Features:**
   - Song extension (continue/expand)
   - Audio style transformation
   - Vocal separation
   - Music video generation (API.box supports)

### 11.2 Testing Improvements

1. **Unit Tests:**
   - Test prompt building logic
   - Mock API.box responses
   - Validate error handling

2. **Integration Tests:**
   - End-to-end flow testing
   - Webhook simulation
   - Storage integration tests

3. **E2E Tests:**
   - Full user journey
   - Payment → Generation → Delivery
   - Error scenario coverage

---

## 12. Deployment Checklist

### 12.1 Environment Variables

- [ ] API_BOX_KEY set in production
- [ ] BASE_URL or NEXT_PUBLIC_BASE_URL set
- [ ] Stripe variables configured
- [ ] Supabase variables configured

### 12.2 Supabase Setup

- [ ] 'tracks' bucket created and public
- [ ] 'lyrics' bucket created and public
- [ ] Storage policies configured
- [ ] Database schema up to date

### 12.3 API.box Account

- [ ] Account created and verified
- [ ] API key generated
- [ ] Credits purchased
- [ ] Webhook URL registered (if required)

### 12.4 Testing

- [ ] Test song generation with test endpoint
- [ ] Verify webhook receives callbacks
- [ ] Check storage uploads work
- [ ] Test complete payment → delivery flow
- [ ] Verify email delivery (if implemented)

### 12.5 Monitoring

- [ ] Set up logging aggregation
- [ ] Monitor API.box credit usage
- [ ] Track generation success rate
- [ ] Alert on failed orders

---

## 13. File Changes Summary

### Modified Files (6)

1. `src/app/api/stripe-webhook/route.ts`
   - Added song generation trigger after payment
   - ~25 new lines

2. `src/app/layout.tsx`
   - Added suppressHydrationWarning
   - 1 line change

3. `src/app/page.tsx`
   - Added Snowfall and TestApiButton components
   - Christmas theming
   - ~10 new lines

4. `src/app/thank-you/page.tsx`
   - Christmas color scheme
   - Updated messaging
   - ~30 line changes

5. `src/components/SongForm.tsx`
   - Complete Christmas color replacement
   - ~50+ line changes (mostly colors)

6. `tailwind.config.ts`
   - New color palette
   - New animations
   - ~40 new lines

### New Files (10)

1. `src/lib/generateSong.ts` (189 lines)
2. `src/components/Snowfall.tsx` (49 lines)
3. `src/components/TestApiButton.tsx` (112 lines)
4. `src/app/api/box-webhook/route.ts` (310 lines)
5. `src/app/api/test-box-api/route.ts` (207 lines)
6. `api-box.md` (documentation)
7. `NGROK_SETUP.md` (documentation)
8. `NGROK_AUTH_SETUP.md` (documentation)
9. `MANUAL_WEBHOOK_TEST.md` (documentation)
10. `start-ngrok.sh` (utility script)

### Total Impact

- **Lines Added:** ~900+
- **Files Created:** 10
- **Files Modified:** 6
- **Documentation:** 4 new MD files

---

## 14. Dependencies

### New Dependencies Needed?

**None!** All new features use existing dependencies:
- `next` - API routes
- `stripe` - Payment webhooks (existing)
- Supabase - Storage (existing)
- Tailwind - Theming (existing)

### External Services

1. **API.box** (new)
   - Music generation service
   - Webhook callbacks
   - File hosting (temporary)

2. **Ngrok** (development only)
   - Local webhook testing
   - Not required in production

---

## 15. Known Issues & Limitations

### 15.1 Current Limitations

1. **No Retry Logic:**
   - Failed generations require manual intervention
   - No automatic retry mechanism

2. **No Progress Updates:**
   - Users don't know when song is being generated
   - No status page for checking progress

3. **TestApiButton in Production:**
   - Currently visible on main page
   - Should be removed or hidden before production

4. **Webhook Security:**
   - No signature validation
   - Trusts all incoming webhooks

5. **Error Notifications:**
   - Failed generations don't notify users
   - Admin must monitor logs

### 15.2 Development Considerations

1. **Localhost Webhooks:**
   - Require ngrok for testing
   - Not obvious from error messages

2. **API Credits:**
   - Test endpoint consumes real credits
   - Could add cost quickly during development

3. **Storage Cleanup:**
   - No mechanism to clean up failed uploads
   - Test orders remain in database

---

## 16. Migration Notes

### 16.1 Database

**No migration required!** Existing schema already supports:
- mp3_url, wav_url, lyrics_url columns
- delivered_at timestamp
- Status enum includes 'processing', 'delivered', 'failed'

### 16.2 Environment

**New Variables Required:**
```env
API_BOX_KEY=xxx
```

**Optional (development):**
```env
NGROK_URL=https://xxxx.ngrok-free.app
```

### 16.3 Deployment Steps

1. Add API_BOX_KEY to environment
2. Create Supabase storage buckets (tracks, lyrics)
3. Deploy code changes
4. Test with test-box-api endpoint
5. Monitor logs for successful generation

---

## 17. Conclusion

This update represents a significant milestone for SongPebble, establishing complete automation from payment to song delivery. The integration is production-ready with the following caveats:

**✅ Ready for Production:**
- Core song generation flow
- Webhook handling
- Storage integration
- Error handling
- Logging

**⚠️ Needs Review:**
- Remove TestApiButton from production
- Add webhook signature validation
- Implement user notifications
- Add retry mechanism
- Monitor API.box credit usage

**🎄 Bonus:**
- Festive Christmas theme
- Delightful snowfall animation
- Holiday-ready messaging

The codebase is well-structured, thoroughly documented, and ready for testing. The addition of comprehensive logging will make debugging and monitoring straightforward in production.

---

**Report Generated:** November 25, 2025
**Generated By:** Claude Code Analysis
**Total Changes:** 16 files affected, ~900+ lines added

# Supabase Storage Setup

This document provides instructions for setting up storage buckets in Supabase for SongPebble.

## Overview

We need two storage buckets to store generated song files:

1. `tracks` - For MP3 and WAV audio files
2. `lyrics` - For lyrics text files

Both buckets should be **private** and only accessible via signed URLs.

## Step 1: Create Storage Buckets

### Via Supabase Dashboard

1. Go to your Supabase project: <https://supabase.com/dashboard/project/rdaxhmozqqogdqlqezyp>
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**

#### Create the `tracks` bucket

- **Name**: `tracks`
- **Public bucket**: **UNCHECK** (must be private)
- Click **"Create bucket"**

#### Create the `lyrics` bucket

- **Name**: `lyrics`
- **Public bucket**: **UNCHECK** (must be private)
- Click **"Create bucket"**

## Step 2: Configure Storage Policies (OPTIONAL)

### Important Note

**You may not need storage policies at all!** The service role key bypasses RLS policies entirely. If you're only using the service role key server-side (which is the recommended approach), you can skip creating policies.

### When to Create Policies

Only create storage policies if you plan to:

- Allow anon users to access storage (not recommended for this app)
- Have multiple service roles with different permissions
- Want explicit documentation of access patterns

### If You Choose to Create Policies

Run the SQL script: `supabase/05_storage_policies.sql`

Or follow the manual instructions below.

### Important Security Note

❌ **DO NOT** use policies with `or true` - this makes files publicly accessible

✅ **DO** use signed URLs for temporary, secure access

### Recommended Approach (Simplest)

1. **Don't add any storage policies**
2. Use the service role key server-side to generate signed URLs
3. Service role bypasses all policies automatically
4. Signed URLs provide temporary, secure access

## Step 3: Test Storage Access

### Via Dashboard

1. Go to **Storage** → `tracks`
2. Try uploading a test file manually
3. Check that you **cannot** access it without authentication

### Via Code

See `src/lib/supabase.ts` for client setup.

```typescript
import { createClient } from '@supabase/supabase-js'

// Server-side client with service role (can bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Upload a file
const { data, error } = await supabaseAdmin.storage
  .from('tracks')
  .upload('test-order-id/song.mp3', fileBuffer, {
    contentType: 'audio/mpeg',
    upsert: false
  })

// Generate a signed URL (expires in 1 hour)
const { data: urlData, error: urlError } = await supabaseAdmin.storage
  .from('tracks')
  .createSignedUrl('test-order-id/song.mp3', 3600)

console.log('Signed URL:', urlData.signedUrl)
```

## File Structure

Files should be organized by order ID:

```text
tracks/
  ├── {orderId}/
  │   ├── song.mp3
  │   └── song.wav
lyrics/
  └── {orderId}/
      └── lyrics.txt
```

Example:

```text
tracks/550e8400-e29b-41d4-a716-446655440000/song.mp3
tracks/550e8400-e29b-41d4-a716-446655440000/song.wav
lyrics/550e8400-e29b-41d4-a716-446655440000/lyrics.txt
```

## Security Checklist

- [ ] Both buckets are set to **private** (public checkbox unchecked)
- [ ] No RLS policies with `or true` or similar permissive conditions
- [ ] Service role key is stored in `.env.local` and **never** committed to git
- [ ] Signed URLs are generated server-side only (never client-side)
- [ ] Signed URLs have reasonable expiration times (1-24 hours recommended)
- [ ] File paths include order ID for organization and access control

## Troubleshooting

### "No policy found" error when uploading

- Ensure you're using the **service role key**, not the anon key
- Service role bypasses RLS, so no policies needed

### Files are publicly accessible

- Check bucket is set to **private** in dashboard
- Remove any permissive RLS policies (`or true`)

### Cannot access files with signed URL

- Ensure URL is generated with service role key
- Check URL hasn't expired
- Verify bucket name and file path are correct

## Next Steps

After setting up storage:

1. Test uploading a file via the dashboard
2. Test generating a signed URL in code
3. Verify signed URL works in browser
4. Move on to implementing the delivery pipeline

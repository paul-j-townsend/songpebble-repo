-- ============================================================================
-- Supabase Storage Policies for SongPebble
-- ============================================================================
-- This script creates storage policies for the tracks and lyrics buckets
-- Run this AFTER creating the storage buckets in the Supabase dashboard
--
-- Note: This script drops existing policies before creating new ones,
-- so it's safe to run multiple times
-- ============================================================================

-- ============================================================================
-- TRACKS BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for tracks bucket (if they exist)
DROP POLICY IF EXISTS "Service role can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete files" ON storage.objects;

-- Create policies for tracks bucket
CREATE POLICY "Service role can upload files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'tracks');

CREATE POLICY "Service role can update files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'tracks');

CREATE POLICY "Service role can delete files"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'tracks');

-- ============================================================================
-- LYRICS BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for lyrics bucket (if they exist)
DROP POLICY IF EXISTS "Service role can upload lyrics" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update lyrics" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete lyrics" ON storage.objects;

-- Create policies for lyrics bucket
CREATE POLICY "Service role can upload lyrics"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'lyrics');

CREATE POLICY "Service role can update lyrics"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'lyrics');

CREATE POLICY "Service role can delete lyrics"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'lyrics');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Storage policies created successfully!';
  RAISE NOTICE '✓ Tracks bucket: 3 policies (insert, update, delete)';
  RAISE NOTICE '✓ Lyrics bucket: 3 policies (insert, update, delete)';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Signed URLs work automatically for private buckets';
  RAISE NOTICE 'when generated server-side with the service role key.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Test uploading a file via the dashboard or code';
END $$;

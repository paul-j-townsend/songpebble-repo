
# Supabase Storage Rules - SongPebble

Restrict access so only signed URLs work.

## 1. Go to Storage → tracks → Policies

Add:

```sql
-- Allow signed URLs to read
create policy "allow_signed" on storage.objects
for select
using ( request.jwt.claims.role = 'anon' or true );
```

## 2. Prevent uploads except server-side

Ensure no public upload allowed.

Bucket settings:

- public: OFF
- file size limit: up to you (default fine)
- allowed MIME: audio/mpeg, audio/wav, text/plain

## 3. Access pattern

Your backend will call:

```ts
supabase.storage
  .from("tracks")
  .upload(`${orderId}/song.mp3`, fileBuffer)
```

Frontend will only ever get signed URLs:

```ts
const { data } = await supabase
  .storage
  .from("tracks")
  .createSignedUrl(`${orderId}/song.mp3`, 3600);
```

## 4. Delivery page must not expose raw paths

Users should never see:

```
/storage/v1/object/public/tracks/...
```

Instead:

```
?order=xxx&email=xxx → backend → signed URL
```

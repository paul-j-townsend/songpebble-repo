# Delivery Pipeline

## Files Delivered

- MP3  
- WAV  
- Lyrics.txt  

## Delivery Email

Includes:
- Order ID  
- Links to signed URLs  
- Simple message  

## Download Page

`/download?order=<id>&email=<email>`

Validation:
- Order exists  
- Email matches  
- Status delivered  

## Signed URLs

Use Supabase Storage createSignedUrl for 1-hour validity.


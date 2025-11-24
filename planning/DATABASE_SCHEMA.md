# Supabase Database Schema

## orders table

id (uuid)  
created_at (timestamp)  
status (text: pending, paid, delivered)  
email (text)  
genre (text)  
vocal (text)  
names (text)  
catchphrases (text)  
mood (text)  
custom_lines (text)  
stripe_session_id (text)  
final_mp3_url (text)  
final_wav_url (text)  
lyrics_url (text)

## deliveries table

id (uuid)  
order_id (uuid)  
delivered_at (timestamp)  
email_sent (boolean)  
delivery_attempts (int)

## Storage

- tracks  
- lyrics  


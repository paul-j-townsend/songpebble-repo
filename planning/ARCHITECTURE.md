# Architecture Overview

This project delivers custom AI-generated songs using a clean 4-step pipeline:

1. User submits song details via React UI.
2. User pays upfront through Stripe Checkout.
3. Stripe Webhook confirms payment.
4. Backend generates the track and delivers it via download link.

## Stack

- Frontend: React / Next.js + TailwindCSS
- Forms: React Hook Form + Zod
- Backend: Node / Next.js API routes
- Database: Supabase
- Payments: Stripe Checkout
- Email: Postmark or Resend

## Flow Summary

### 1. User Form (React)
Collect:
- genre
- vocal
- names
- catchphrases
- mood
- custom lines
- email

### 2. Payment (Stripe Checkout)
Backend creates session, React redirects to URL.

### 3. Payment Confirmation (Webhook)
Webhook validates payment, updates Supabase.

### 4. Track Delivery
After manual or automated generation:
- Upload MP3/WAV/lyrics
- Send email with signed URLs

## Folder Structure

/src  
  /components  
  /lib  
  /pages or /app  
  /api  
/docs  
  *markdown files*



# Supabase SQL - SongPebble Tables

Run these in the Supabase SQL Editor.

## 1. orders table

```sql
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  status text not null default 'pending', -- pending, paid, delivered
  email text not null,
  genre text not null,
  vocal text not null,
  names text not null,
  catchphrases text,
  mood text not null,
  custom_lines text,
  stripe_session_id text,
  final_mp3_url text,
  final_wav_url text,
  lyrics_url text
);
```

## 2. deliveries table

```sql
create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  delivered_at timestamptz default now(),
  email_sent boolean default false,
  delivery_attempts int default 0
);
```

## 3. indexes

```sql
create index orders_status_idx on orders(status);
create index orders_stripe_idx on orders(stripe_session_id);
```

## 4. Storage buckets

In Supabase dashboard:

- tracks
- lyrics

Set public = false.

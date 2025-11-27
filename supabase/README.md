# Supabase Database Setup

This folder contains all the SQL scripts and documentation needed to set up the SongPebble database.

## Quick Start

### Option 1: Run All-in-One Script (Recommended)

1. Open your Supabase project: https://supabase.com/dashboard/project/rdaxhmozqqogdqlqezyp
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy the contents of `00_setup_all.sql` and paste it into the editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Wait for the success message

✅ This creates all tables, indexes, triggers, and security policies in one go.

### Option 2: Run Scripts Individually

If you prefer to run scripts step-by-step:

1. `01_create_orders_table.sql` - Creates the orders table
2. `02_create_deliveries_table.sql` - Creates the deliveries table
3. `03_create_indexes.sql` - Creates all indexes and triggers

Run each script in the Supabase SQL Editor in order.

## Files in This Directory

| File | Description |
|------|-------------|
| `00_setup_all.sql` | All-in-one script that runs everything |
| `01_create_orders_table.sql` | Creates orders table with RLS |
| `02_create_deliveries_table.sql` | Creates deliveries table with foreign key |
| `03_create_indexes.sql` | Creates indexes and updated_at triggers |
| `04_storage_setup.md` | Instructions for setting up storage buckets |
| `README.md` | This file |

## Database Schema

### Orders Table

Stores customer orders and their payment/delivery status.

**Key fields:**
- `id` - UUID primary key
- `customer_email` - Customer email address
- `occasion`, `tone` - Occasion type and tone for lyrics
- `song_title`, `song_style`, `lyrics_input` - Song details
- `lyric_provider` - Source of lyrics generation (`claude` or template fallback)
- `stripe_session_id` - Stripe Checkout session ID
- `status` - Order status: `pending` → `paid` → `processing` → `delivered`
- `mp3_url`, `wav_url`, `lyrics_url` - File storage URLs (populated after delivery)
- Timestamps: `created_at`, `updated_at`, `paid_at`, `delivered_at`

### Deliveries Table

Tracks email deliveries sent to customers.

**Key fields:**
- `id` - UUID primary key
- `order_id` - Foreign key to orders table
- `recipient_email` - Email address
- `status` - Delivery status: `sent`, `delivered`, `bounced`, `failed`
- `email_provider` - Which service sent the email (`postmark` or `resend`)
- `error_message` - Error details if delivery failed
- Timestamps: `created_at`, `updated_at`, `delivered_at`

## Security

### Row Level Security (RLS)

Both tables have RLS enabled with a "deny all" policy for public access.

**All database operations must use the service role key server-side:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
)
```

❌ **Never use the service role key client-side** - it has full database access.

✅ **Always use service role key in API routes** - this is the intended pattern.

### Why Service Role?

The anon key respects RLS policies, which we've set to deny all public access. This is intentional - customers should not directly access the database. All access goes through API routes which use the service role key server-side.

## Storage Setup

After running the SQL scripts, you need to set up storage buckets for files.

**Follow the instructions in:** `04_storage_setup.md`

Quick summary:
1. Create two private buckets: `tracks` and `lyrics`
2. Do NOT add any permissive RLS policies
3. Access files via signed URLs generated server-side

## Verification

### Test Database Connection

```bash
npm run test-supabase
```

This should show:
- ✓ Connection successful
- ✓ Auth endpoint accessible

### Test Table Creation

Run this query in the Supabase SQL Editor:

```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('orders', 'deliveries');
```

Expected output:
```
orders      | 18
deliveries  | 10
```

### Test Indexes

```sql
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'deliveries')
ORDER BY tablename, indexname;
```

Should show 9 custom indexes plus primary key indexes.

## Troubleshooting

### "permission denied" errors
- Make sure you're using the **service role key** in your API routes
- Check that RLS is enabled (it should be)
- The service role key bypasses RLS - if you're still getting permission errors, check your Supabase project settings

### "relation does not exist" errors
- The tables haven't been created yet - run the SQL scripts
- Make sure you're using the correct table names: `public.orders` and `public.deliveries`

### Cannot insert/update/delete from tables
- Verify you're using `SUPABASE_SERVICE_ROLE_KEY` not `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- The anon key cannot access these tables due to RLS policies (by design)

## Next Steps

After setting up the database:

1. ✅ Complete Phase 2: Set up storage buckets (see `04_storage_setup.md`)
2. ⏭️ Move to Phase 3: Set up Stripe (see `planning/todo.md`)
3. ⏭️ Phase 4: Build the form and validation
4. ⏭️ Phase 5: Create API routes

See `planning/todo.md` for the complete development roadmap.

## SQL Best Practices

These scripts follow best practices:

- ✅ Use `IF NOT EXISTS` to make scripts idempotent
- ✅ Enable RLS by default for security
- ✅ Use UUIDs for primary keys (better for distributed systems)
- ✅ Add indexes on frequently queried columns
- ✅ Use CHECK constraints for data validation
- ✅ Add helpful comments for documentation
- ✅ Use TIMESTAMPTZ for timezone-aware timestamps
- ✅ Auto-update `updated_at` with triggers

## Support

If you encounter issues:

1. Check the Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify your environment variables are set correctly
3. Review the troubleshooting section above
4. Check the main project README for additional help

# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router entrypoint with layouts, marketing pages (`download`, `thank-you`), and API handlers in `api/create-order` and `api/stripe-webhook`.
- `src/components`: Client-only UI such as `SongForm`; consolidate reusable Tailwind patterns here.
- `src/lib`: Domain helpers and validation schemas (e.g., `songSchema`) imported via the `@/` alias.
- `supabase`: Ordered SQL migrations (`00_setup_all.sql` …) and README instructions; add new scripts with the next numeric prefix.
- `planning` & `STRIPE_SETUP.md`: Product notes plus Stripe onboarding steps—keep them updated when flows change.
- `test-supabase.mjs`: Health-check script that ensures Supabase env vars, tables, and policies exist before hitting the API.

## Build, Test, and Development Commands
- `npm run dev` – Starts the Next.js dev server with Hot Refresh; requires a complete `.env.local`.
- `npm run build` – Compiles the production bundle and validates route handlers.
- `npm run start` – Serves the previously built output (what we deploy).
- `npm run lint` – Runs ESLint with `eslint-config-next` and Tailwind conventions; fixes most formatting issues.
- `npm run test:supabase` – Executes `test-supabase.mjs` to verify Supabase credentials, storage buckets, and policies.

## Coding Style & Naming Conventions
- Use TypeScript everywhere; favor async/await and descriptive `Song*` types exported from `src/lib`.
- Default to server components; add `'use client'` only when hooking into state, browser APIs, or form libraries.
- Keep indentation at 2 spaces (Next.js + Prettier default) and rely on `npm run lint` for enforcement.
- Name components/files in `PascalCase` (`SongForm.tsx`), helpers in `camelCase`, env vars in `SCREAMING_SNAKE_CASE`, and route folders in kebab-case.
- Compose UI with Tailwind utility classes; extract repeated layouts into `src/components` rather than inline styles.

## Testing Guidelines
- Run both `npm run lint` and `npm run test:supabase` before every PR; they are our current regression net.
- Place new tests beside the module they cover using the `*.test.ts(x)` suffix so they ship with the feature context.
- Mock external services (Stripe, Supabase) by stubbing fetch calls and reusing helpers from `src/lib`.
- Document any new SQL migration or storage change inside `supabase/README.md` and include steps to reproduce fixtures.

## Commit & Pull Request Guidelines
- Follow concise, imperative commit messages (e.g., "Add checkout webhook"), consistent with the existing history.
- Each PR should include: a summary of user impact, references to any Stripe/Supabase scripts touched, screenshots for UI changes, and a checklist of commands you ran.
- Tag reviewers who own affected surfaces (`api`, `supabase`, `components`) and link issues or tickets for traceability.

## Security & Configuration Tips
- Keep Supabase keys, Stripe secrets, and webhook signing secrets in `.env.local`; never hardcode them inside `src`.
- Use `STRIPE_SETUP.md` and the SQL files under `supabase` as the source of truth for provisioning; update them whenever you change environment requirements.
- Before deploying, rerun `npm run test:supabase` and a production `npm run build` to confirm credentials are valid and schemas stay synchronized.

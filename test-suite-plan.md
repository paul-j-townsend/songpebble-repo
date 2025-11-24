# Test Suite Plan

## Goals
- [ ] Catch schema, API, and UI regressions before deployment.
- [ ] Validate Stripe/Supabase integrations with deterministic mocks.
- [ ] Provide confidence in the end-to-end song order journey.

## Testing Layers

### 1. Unit Tests (Vitest)
- [x] Cover `songFormSchema`, `orderSchema`, and `validateEnv` with positive/negative fixtures.
- [x] Mock Stripe helpers (`getStripePriceId`, `getBaseUrl`) and Supabase admin helpers to ensure env guardrails.
- [x] Adopt `vitest` + module mocks; colocate specs under `tests/unit` or `src/lib/__tests__`.

### 2. Component Tests (Vitest + Testing Library)
- [x] Write `SongForm` tests for validation errors, disabled submit state, and fetch/redirect behavior.
- [ ] Add specs for shared buttons/inputs/alerts as they land to guarantee consistent Tailwind styling.
- [x] Use `@testing-library/react` with mocked `fetch` + env, storing specs under `tests/components`.

### 3. API Route Tests (Vitest or Jest)
- [x] `/api/create-order`: mock Supabase + Stripe clients for success, insert failure, session failure, invalid payload.
- [x] `/api/stripe-webhook`: exercise signature verification, idempotency, missing metadata, and expired sessions with raw payload fixtures.
- [x] Organize specs under `tests/api` and invoke handlers directly (App Router helpers optional).

### 4. End-to-End Tests (Playwright)
- [ ] Automate happy-path flow: submit form, capture checkout redirect, simulate webhook, validate thank-you page.
- [ ] Add negative scenarios (invalid form, bad webhook signature, missing order ID).
- [x] Add baseline smoke test verifying homepage CTA renders via Playwright in `tests/e2e`.
- [ ] Decide on mocked vs. real Stripe CLI hooks and run headless Playwright in CI under `tests/e2e`.

## Tooling & Structure
- [x] Adopt `vitest` for unit/component/api layers and Playwright for browser flows.
- [x] Maintain directories: `tests/unit`, `tests/components`, `tests/api`, `tests/e2e`.
- [ ] Store reusable fixtures/mocks under `tests/fixtures` and `tests/mocks` (e.g., Stripe payloads).
- [ ] Target ≥80% coverage on critical modules via `vitest --coverage`.
- [ ] Update CI (e.g., GitHub Actions) to run lint → unit/component/api tests → Playwright before build/deploy.

## Outstanding Decisions
- [x] Choose Supabase/Stripe mocking strategy (module mocks vs. DI/test doubles).
- [ ] Decide whether to include Stripe CLI-driven webhook tests in CI or rely on mocked payloads.
- [ ] Plan data seeding/fixtures for upcoming download + delivery scenarios.

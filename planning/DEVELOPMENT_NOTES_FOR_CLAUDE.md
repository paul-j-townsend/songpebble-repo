
# Development Notes For Claude in Cursor

You are helping build the SongPebble MVP.

Your priorities:

1. Follow the specifications in these markdown files exactly.
2. Keep the implementation minimal, clean, and production sensible.
3. Avoid adding extra abstractions, unused helpers, or generic boilerplate.

## Ground rules

- Use Next.js App Router with TypeScript.
- Use Tailwind classes directly in JSX.
- Use React Hook Form plus Zod for the main song form.
- All Stripe and Supabase logic must live in server side code only.
- The user journey must work end to end before you refactor anything.

## Order of work

1. Initialise the Next.js project as described in `NEXT_APP_ROUTER_SETUP.md`.
2. Implement the Zod schema and the `SongForm` component from `REACT_UI_TS_NEXT.md`.
3. Implement the Supabase and Stripe clients from `API_ROUTES_TS.md`.
4. Implement `/api/create-order` and verify that it can:
   - accept valid payloads
   - create an order row in Supabase
   - create a Stripe Checkout session
   - return the checkout URL
5. Implement the `/api/stripe-webhook` route and test it locally with the Stripe CLI.
6. Implement a simple version of the download page that:
   - validates order ID and email
   - returns placeholder text before the full delivery pipeline is wired up.
7. Only after the basic create-order and webhook flows work:
   - wire in signed URLs from Supabase storage
   - wire in an email provider for delivery.

## Style and code quality

- Prefer small, focused components.
- TypeScript types should be explicit anywhere the compiler cannot infer correctly.
- Handle error states gracefully and log server side errors with `console.error`.
- Do not add unnecessary global state or heavy state management libraries.
- Do not add authentication for the MVP.

## What success looks like

- A user can run the app locally.
- Fill the form.
- Be redirected to Stripe Checkout.
- Complete test payment.
- See a thank you page.
- An order row appears in Supabase with `status = paid` after webhook.
- A download page exists and is ready to be connected to the delivery pipeline.

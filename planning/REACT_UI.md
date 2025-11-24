# React UI Specification

## Pages

1. `/` – Song Form  
2. `/checkout-redirect`  
3. `/thank-you`  
4. `/download`

## Libraries

- react-hook-form
- zod
- @hookform/resolvers
- tailwindcss

## Validation Schema

```ts
import { z } from "zod";

export const songSchema = z.object({
  genre: z.string().min(1),
  vocal: z.enum(["male", "female"]),
  names: z.string().max(500),
  catchphrases: z.string().optional(),
  mood: z.string().min(1),
  email: z.string().email(),
  customLines: z.string().optional()
});
```

## SongForm Component

- Uses RHF + Zod
- Submits to `/api/create-order`
- Redirects to checkout URL

## UI Requirements

- Clean, simple mobile-first layout
- Clear button: "Create My Song (£20)"


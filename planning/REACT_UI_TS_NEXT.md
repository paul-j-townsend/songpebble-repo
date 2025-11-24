
# React UI - TypeScript + Next.js App Router

This file specifies the TypeScript based React UI using the Next.js App Router.

## 1. Zod schema

`src/lib/songSchema.ts`:

```ts
import { z } from "zod";

export const songSchema = z.object({
  genre: z.string().min(1, "Please choose a genre."),
  vocal: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please choose a vocal style." }),
  }),
  names: z.string().min(1, "Please add at least one name.").max(500),
  catchphrases: z.string().optional(),
  mood: z.string().min(1, "Please describe the mood or style."),
  email: z.string().email("Please enter a valid email address."),
  customLines: z.string().optional(),
});

export type SongFormValues = z.infer<typeof songSchema>;
```

## 2. SongForm component

`src/components/SongForm.tsx`:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { songSchema, SongFormValues } from "@/lib/songSchema";
import { useState } from "react";

export function SongForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
  });

  const onSubmit = async (values: SongFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const data = await res.json();
      if (!data.checkoutUrl) {
        throw new Error("No checkout URL returned.");
      }

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setServerError(err.message || "Could not start checkout.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Genre
        </label>
        <input
          {...register("genre")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Pop, rock, lo-fi, etc."
        />
        {errors.genre && (
          <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Vocal
        </label>
        <select
          {...register("vocal")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select vocal style</option>
          <option value="male">Male vocals</option>
          <option value="female">Female vocals</option>
        </select>
        {errors.vocal && (
          <p className="mt-1 text-sm text-red-600">{errors.vocal.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Names to include
        </label>
        <textarea
          {...register("names")}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="List the names you want mentioned in the song."
        />
        {errors.names && (
          <p className="mt-1 text-sm text-red-600">{errors.names.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Catchphrases or in jokes
        </label>
        <textarea
          {...register("catchphrases")}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Optional fun phrases, memories, or references."
        />
        {errors.catchphrases && (
          <p className="mt-1 text-sm text-red-600">
            {errors.catchphrases.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mood or style
        </label>
        <input
          {...register("mood")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Upbeat, emotional, chilled, party vibe, etc."
        />
        {errors.mood && (
          <p className="mt-1 text-sm text-red-600">{errors.mood.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your email
        </label>
        <input
          {...register("email")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="We will send your track here."
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Optional specific lines
        </label>
        <textarea
          {...register("customLines")}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="If there are exact lines you would love included, add them here."
        />
        {errors.customLines && (
          <p className="mt-1 text-sm text-red-600">
            {errors.customLines.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Starting checkout..." : "Create My Song (£20)"}
      </button>
    </form>
  );
}
```

## 3. page.tsx

`src/app/page.tsx`:

```tsx
import { SongForm } from "@/components/SongForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            SongPebble
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tell us your story and we will turn it into a custom AI generated song.
          </p>
        </header>

        <SongForm />
      </div>
    </main>
  );
}
```

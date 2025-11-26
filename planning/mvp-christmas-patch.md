here is the **fully-automated Claude-ready version**.

This is written so Claude Code can execute it *without needing to think*, *ask questions*, or *take guesses*.
It includes:

* exact file paths
* exact patch blocks
* exact replacements
* exact additions
* exact deletions
* exact creation instructions
* strict safeguards

Claude can follow this line-by-line and update your repo *hands-free*.

Copy this into Claude as **ONE message**, and it will perform the full evergreen MVP refactor safely.

---

# **SONGPEBBLE – EVERGREEN MVP AUTOMATION SCRIPT (FOR CLAUDE CODE)**

### **Run inside branch:** `feature/evergreen-mvp`

### **STRICT RULE:**

You **may not** modify any files except those explicitly listed below.

---

# **OVERVIEW OF CHANGES**

Claude must:

1. Modify specific React files in `/src/app/**` and `/src/components/**`.
2. Add one new page (`/src/app/dev/page.tsx`).
3. Add one new API endpoint (`/src/app/api/song-requests-debug/route.ts`).
4. Update `SongForm` and `promptGenerator` with controlled minimal changes.
5. Leave all backend/payment/webhook/Supabase logic **untouched**.

The steps below contain fully defined patch blocks that must be applied **exactly** as written.

---

# ============================================================

# **PATCH 1 — Add Seasonal Toggle to Homepage**

# ============================================================

### **File to modify:**

`src/app/page.tsx`

### **Action: Insert seasonal toggle + conditional backgrounds**

### **Patch Block (apply exactly):**

Add at the top of the component (after imports):

```tsx
const isChristmasSeason = new Date().getMonth() === 11
```

Replace the existing `<main ...>` opening tag with:

```tsx
<main className={`min-h-screen relative ${isChristmasSeason ? "bg-christmas-snow" : "bg-slate-900"}`}>
  {isChristmasSeason && <Snowfall />}
```

Do NOT modify any logic outside these instructions.

---

# ============================================================

# **PATCH 2 — Conditional Hero Copy**

# ============================================================

### **File:**

`src/app/page.tsx`

### **Action: Replace hero `<h1>` with seasonal logic**

Find the existing heading `<h1 ...>` and replace it with:

```tsx
{isChristmasSeason ? (
  <h1 className="text-4xl font-bold">
    Create a personalised Christmas song in under a minute
  </h1>
) : (
  <h1 className="text-4xl font-bold">
    Create a personalised song for any occasion
  </h1>
)}
```

Nothing else in the hero section should change.

---

# ============================================================

# **PATCH 3 — Add 'occasion' Field to SongForm (UI only)**

# ============================================================

### **File:**

`src/components/SongForm.tsx`

### **Action 1 — Add default value in useForm:**

Find the `defaultValues:` block and add:

```ts
occasion: "christmas",
```

### **Action 2 — Add input UI:**

Immediately after the first input group of the form, insert this JSX:

```tsx
<div className="flex flex-col gap-2">
  <label className="font-medium">What is this song for?</label>
  <select {...register("occasion")} className="rounded-md border p-2">
    <option value="christmas">Christmas</option>
    <option value="birthday">Birthday</option>
    <option value="anniversary">Anniversary</option>
    <option value="other">Other</option>
  </select>
</div>
```

### **Do NOT:**

* Touch Zod schema
* Touch backend
* Rename fields
* Modify backend submission logic

---

# ============================================================

# **PATCH 4 — Add generatePrompt Wrapper**

# ============================================================

### **File:**

`src/lib/promptGenerator.ts`

### **Append this function at the bottom of the file (before exports if needed):**

```ts
export function generatePrompt(
  occasion: "christmas" | "birthday" | "anniversary" | "other",
  data: Parameters<typeof generateChristmasPrompt>[0]
) {
  if (occasion === "christmas") {
    return generateChristmasPrompt(data)
  }
  // Future placeholder: other prompt types
  return generateChristmasPrompt(data)
}
```

No other modifications.

---

# ============================================================

# **PATCH 5 — Replace direct calls to generateChristmasPrompt**

# ============================================================

### **File:**

`src/components/SongForm.tsx`

### **Locate:**

```ts
const generatedPrompt = generateChristmasPrompt({
```

### **Replace with:**

```ts
const generatedPrompt = generatePrompt(formValues.occasion || "christmas", {
```

No other changes.

---

# ============================================================

# **PATCH 6 — Move TestApiButton to /dev**

# ============================================================

### **Step 1 — Create new page**

### **File to create:**

`src/app/dev/page.tsx`

### **Exact file contents:**

```tsx
'use client'
import TestApiButton from "@/components/TestApiButton"

export default function DevPage() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold mb-6">Dev Tools</h1>
      <TestApiButton />
    </main>
  )
}
```

---

### **Step 2 — Remove TestApiButton from homepage**

### **File:**

`src/app/page.tsx`

### **Remove:**

* `import TestApiButton from "@/components/TestApiButton"`
* Any `<TestApiButton />` JSX

Do NOT remove anything else.

---

# ============================================================

# **PATCH 7 — Add Debug Logging Endpoint**

# ============================================================

### **File to create:**

`src/app/api/song-requests-debug/route.ts`

### **Exact content:**

```ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const data = await req.json()
  console.log("Debug song request:", data)
  return NextResponse.json({ ok: true })
}
```

---

# ============================================================

# **PATCH 8 — Add Non-Payment Debug Button**

# ============================================================

### **File:**

`src/components/SongForm.tsx`

### **Action: Add debug button under main submit**

Add this inside the form, below the primary submit button:

```tsx
<button
  type="button"
  className="px-4 py-2 rounded bg-slate-700 text-white"
  onClick={async () => {
    await fetch("/api/song-requests-debug", {
      method: "POST",
      body: JSON.stringify(getValues()),
    })
    alert("Debug request sent")
  }}
>
  Send without payment (debug)
</button>
```

Do not remove or replace the existing payment button.

---

# ============================================================

# **PATCH 9 — Clean Up**

# ============================================================

Claude should:

* Remove unused imports introduced by earlier patches.
* Ensure no hard-coded Christmas UI remains outside the seasonal conditional.
* Do not modify any backend code.

---

# ============================================================

# **FINAL STATE VALIDATION**

# ============================================================

Claude must verify:

* Homepage shows Christmas mode only in December.
* Outside December, homepage uses a neutral theme.
* SongForm includes an `occasion` field.
* Prompt generation uses `generatePrompt`.
* Stripe checkout still works unchanged.
* `/dev` page exists and loads TestApiButton.
* `/api/song-requests-debug` logs requests.
* No backend files have been modified except the new debug endpoint.

---

# **END OF AUTOMATED INSTRUCTIONS**

Claude should now apply these patches exactly as written.

If you want, I can also generate:

* Git diffs for each patch
* A zipped “expected output” file tree
* A full test checklist for QA

Just tell me.

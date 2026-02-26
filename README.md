This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Supabase setup & recommended usage 🔧

This repository includes basic Supabase examples and the recommended auth pattern for Next.js App Router:

- Create a local `.env.local` from `.env.example` with the values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Recommended helpers (from `@supabase/auth-helpers-nextjs`):
  - **Client components:** `createClientComponentClient()` (see `components/SupabaseTest.tsx`)
  - **Server components:** `createServerComponentClient()` (see `components/SupabaseServerTest.tsx`)
  - **Route handlers:** `createRouteHandlerClient()` (see `app/api/supabase/route.ts`)

- `src/lib/supabaseClient.ts` now exports `createAnonSupabaseClient()` for server-only, non-auth usage.

This setup keeps cookie-based auth working cleanly in client, server, and route contexts.

---

## MVP routes added ✅

Implemented minimal planner-first workflows and scaffold pages:

- **/signup** — sign up (email/password)
- **/login** — sign in (password or magic link)
- **/dashboard** — authenticated dashboard; create organizations/weddings
- **/weddings** — list of weddings for the current user
- **/weddings/new** — create a wedding (generates a public slug)
- **/i/[slug]** — public intake form for a wedding (POSTs to `/api/intake/[slug]`)

There are also API route handlers:
- **POST /api/weddings** — creates weddings for authenticated users
- **POST /api/intake/[slug]** — accepts public intake submissions

Note: The pages try to use Supabase tables (`organizations`, `weddings`, `leads`). If these tables do not exist yet you'll see helpful error messages in the UI. For a complete demo, create these tables in your Supabase project or modify the handlers to match your schema.

---

## Dev hygiene & CI ✅

A few helpful utilities and scripts were added to improve dev experience:

- Formatting: `prettier` with config in `.prettierrc`. Run `npm run format` to auto-format your code.
- Linting: `eslint` is configured; run `npm run lint` to lint and auto-fix issues.
- Pre-commit hooks: `husky` + `lint-staged` are wired to run `prettier` and `eslint --fix` on staged files. After installing dependencies run `npm run prepare` to install hooks locally.
- CI: A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm run lint`, `npm run format:check`, and `npm run build` on pushes and pull requests.

These changes help keep the codebase consistent and give quick feedback on PRs.

# eFootball Tournament Hub

A complete eFootball tournament management platform: create tournaments, add participants,
randomize FIFA-style groups, lock groups to auto-generate fixtures, enter match results, and
let standings, goal stats, and progress update automatically. Every tournament gets a short,
shareable code (e.g. `EFO-8K4P2`) that visitors can use to follow along without an account.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (hand-rolled, shadcn-style UI primitives — no external component lib)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (Credentials provider, JWT sessions, bcrypt password hashing)
- **Deployment:** Vercel + GitHub

## Getting Started Locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up your database**

   Create a free Postgres database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com),
   [Railway](https://railway.app), or Vercel Postgres) and copy the connection string.

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
   - `NEXT_PUBLIC_SITE_URL` — same as above locally

4. **Push the database schema**

   ```bash
   npm run db:push
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel project settings
   (use your production `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL`, e.g. `https://yourdomain.com`).
4. Deploy. The `build` script automatically runs `prisma generate` first.
5. Run `npx prisma db push` (pointed at your production `DATABASE_URL`) once to create the schema
   in your production database — you can do this locally with the production `.env` values, or via
   a one-off Vercel deployment hook.

## Project Structure

```
prisma/schema.prisma        Database schema (User, Tournament, Participant, Group, Match, ...)
src/actions/                Server actions (auth, tournament, participant, group, match)
src/app/                    Routes (App Router)
  (auth)/                   Sign up / login / forgot & reset password
  dashboard/                Authenticated organizer dashboard + tournament management
  tournament/[code]/        Public tournament pages (overview, groups, fixtures, results, standings, match detail)
  tournaments/               Public tournament search/browse page
src/components/             Shared UI (design system + domain components)
src/lib/                    Prisma client, auth config, standings/fixture logic, validation schemas
```

## Core Logic Notes

- **Tournament codes** are generated in `src/lib/tournamentCode.ts`, checked for uniqueness against
  the database, and matched case-insensitively.
- **Fixture generation** (`src/lib/fixtures.ts`) creates a full round-robin within each group
  (`N × (N - 1) / 2` matches), with no duplicates and no self-matches.
- **Standings and goal stats are always derived from match results** (`src/lib/standings.ts`) —
  nothing is manually entered or duplicated in the database. Editing a score automatically
  recalculates everything downstream.
- **Authorization**: every mutating server action re-verifies that the logged-in user owns the
  tournament before making changes (see the `assertOwnership` helpers in `src/actions/*`).

## Known Starter Limitations (by design, per the "future expansion" scope)

- Password reset currently logs the reset link to the server console instead of sending an email —
  wire up a provider like [Resend](https://resend.com) or Postmark in `src/actions/auth.ts` for
  production use.
- Only the group stage is implemented. The schema and status enum (`KNOCKOUT_STAGE`, etc.) leave
  room to add knockout rounds, additional formats, player profiles, and more later without a
  redesign.

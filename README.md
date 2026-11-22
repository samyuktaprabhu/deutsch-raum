# Deutschraum

**Your personal German-learning classroom — from A2 refresh to B1 confidence.**

Deutschraum is a React + Vite learning app with Supabase authentication and learner-specific progress tracking. The initial roadmap is designed around *Netzwerk neu B1* and telc B1 preparation.

## Current features

- Email/password registration, sign-in and password reset
- Google sign-in button (requires Google OAuth provider setup in Supabase)
- Supabase-backed learner profiles and enrollments
- 32-session weekday roadmap: A2 refresh, 12 B1 chapter sessions and telc preparation
- Per-learner lesson completion and progress percentage
- Row Level Security policies for learner-owned profile and progress data
- Responsive classroom interface

**Current scope:** this is the authentication, dashboard and progress foundation. Full lesson explanations, interactive exercises, quizzes, answer checking and study-time analytics are planned next; they are not yet implemented.

## Stack

- React 19 + Vite
- Supabase Auth and Postgres
- Netlify deployment

## Run locally

1. Install Node.js 20 or later.
2. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/samyuktaprabhu/deutsche-raum.git
   cd deutsche-raum
   npm install
   ```

3. Copy `.env.example` to `.env.local` and set:

   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Supabase setup

1. Create a Supabase project.
2. Run [supabase/schema.sql](supabase/schema.sql) in the SQL Editor.
3. Run [supabase/seed-lessons.sql](supabase/seed-lessons.sql) to add the 32-session course roadmap.
4. Enable email/password authentication.
5. For Google login, configure the Google provider credentials under Authentication → Sign In / Providers and add the Supabase callback URL in Google Cloud.
6. Add your local and deployed site URLs to the Supabase Auth URL configuration.

Never put a Supabase service-role/secret key or Google OAuth client secret in the frontend or repository. Only the project URL and publishable (or legacy anon) key belong in the Vite frontend environment.

## Netlify deployment

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify's environment variables, then trigger a new deploy.

## Course approach

1. **A2 refresh** — sentence structure, cases, prepositions and tenses.
2. **B1 development** — 12 chapters, with two sessions per chapter, matched to the learner's own *Netzwerk neu B1* edition.
3. **telc B1 preparation** — grammar, reading, listening, writing and speaking.

A suggested 90-minute weekday session:

| Activity | Time |
|---|---:|
| Vocabulary recall | 10 min |
| Grammar focus | 20 min |
| Textbook exercises | 20 min |
| Reading or listening | 15 min |
| Speaking or writing | 15 min |
| Review and corrections | 10 min |

## Textbook and content notice

Deutschraum is an independent learning companion. It is not affiliated with or endorsed by Klett. The *Netzwerk neu B1* textbook, exercises and audio are not included; use your own licensed copy or the publisher's platform.

---

Made for consistent German practice, one evening at a time.

# Deutschraum

**Your personal German-learning classroom — from A2 refresh to B1 confidence.**

Deutschraum is a React + Vite learning app with Supabase authentication and learner-specific progress tracking. The classroom uses an English interface while German exercises and learning content remain in German, with optional English translations.

## Current features

- Email/password registration, sign-in and password reset
- Supabase-backed learner profiles and enrollments
- 32-session A2-to-B1 and telc B1 course roadmap
- Per-learner lesson completion and progress tracking
- Dedicated lesson pages with Listening, Reading, Writing, Speaking and Grammar & Vocabulary sections
- German listening dialogue with browser speech playback, pause, resume, stop and sentence navigation
- Optional English translations for learning instructions and quiz content
- Responsive classroom interface

**Content status:** the lesson workspace is currently a prototype. It contains sample learning material reused across lesson pages; all 32 sessions do not yet have unique, complete lesson content. Writing feedback and spoken-answer assessment are not automated yet.

## Stack

- React 19 + Vite
- Supabase Auth and Postgres
- Netlify deployment

## Run locally

1. Install Node.js 20 or later.
2. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/samyuktaprabhu/deutsch-raum.git
   cd deutsch-raum
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
3. Run [supabase/seed-lessons.sql](supabase/seed-lessons.sql) to add the course roadmap.
4. Enable email/password authentication.
5. Add your local and deployed site URLs to the Supabase Auth URL configuration.

Never put a Supabase service-role/secret key in the frontend or repository. Only the project URL and publishable (or legacy anon) key belong in the Vite frontend environment.

## Netlify deployment

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify's environment variables, then trigger a new deploy.

Live classroom: https://deutsche-raum.netlify.app/

## Course approach

1. **A2 refresh** — sentence structure, cases, prepositions and tenses.
2. **B1 development** — original topics and practical language use.
3. **telc B1 preparation** — grammar, reading, listening, writing and speaking.

Deutschraum is an independent learning companion and is not affiliated with or endorsed by the publisher of *Menschen B1*. Textbook pages, exercises and audio are not reproduced in this app.

---

Made for consistent German practice, one evening at a time.

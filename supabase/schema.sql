-- Deutschraum initial database schema
-- Run once in Supabase Dashboard -> SQL Editor -> New query.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  level text not null default 'B1',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  sequence_no integer not null,
  scheduled_date date,
  level text not null,
  title text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(course_id, sequence_no)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index if not exists lessons_course_sequence_idx on public.lessons(course_id, sequence_no);
create index if not exists lesson_progress_user_idx on public.lesson_progress(user_id);

-- Automatically create a profile when a learner signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable row-level security on every user-facing table.
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "Learners can read own profile" on public.profiles;
create policy "Learners can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Learners can update own profile" on public.profiles;
create policy "Learners can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Authenticated learners can read published courses" on public.courses;
create policy "Authenticated learners can read published courses" on public.courses
  for select to authenticated using (is_published = true);

drop policy if exists "Authenticated learners can read published lessons" on public.lessons;
create policy "Authenticated learners can read published lessons" on public.lessons
  for select to authenticated using (
    is_published = true and exists (
      select 1 from public.courses c
      where c.id = course_id and c.is_published = true
    )
  );

drop policy if exists "Learners can read own enrollments" on public.enrollments;
create policy "Learners can read own enrollments" on public.enrollments
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Learners can enroll themselves" on public.enrollments;
create policy "Learners can enroll themselves" on public.enrollments
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Learners can read own progress" on public.lesson_progress;
create policy "Learners can read own progress" on public.lesson_progress
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Learners can create own progress" on public.lesson_progress;
create policy "Learners can create own progress" on public.lesson_progress
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Learners can update own progress" on public.lesson_progress;
create policy "Learners can update own progress" on public.lesson_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create the initial course. Lessons will be added in the next content step.
insert into public.courses (slug, title, description, level, is_published)
values (
  'a2-to-b1-telc',
  'A2 Refresh to B1 · telc Preparation',
  'A structured weekday evening course using Netzwerk neu B1 as the learner textbook.',
  'B1',
  true
)
on conflict (slug) do nothing;

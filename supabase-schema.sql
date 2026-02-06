-- ============================================================
-- Task Manager — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Tasks table
create table if not exists tasks (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null default '',
  priority        text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  labels          text[] not null default '{}',
  owner           text not null default 'robert' check (owner in ('robert', 'dev')),
  start_date      date,
  expected_completion date,
  completed_at    timestamptz,
  status          text not null default 'todo' check (status in ('todo', 'working', 'blocked', 'completed')),
  archived        boolean not null default false,
  history         text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast filtering by status + archived (the primary query)
create index if not exists idx_tasks_status_archived on tasks (status, archived);

-- Row Level Security: Allow all operations via anon key
-- (The app uses a password gate in the UI and service key for the API route)
alter table tasks enable row level security;

create policy "Allow all access" on tasks
  for all
  using (true)
  with check (true);

-- ============================================================
-- Optional: Seed data (delete this block if you don't want it)
-- ============================================================
insert into tasks (title, description, priority, labels, owner, start_date, expected_completion, status, history) values
  ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated deployments', 'high', '{"devops","infrastructure"}', 'dev', '2026-02-01', '2026-02-10', 'working', '{"Created on Feb 1, 2026"}'),
  ('Design onboarding flow', 'Wireframes and prototypes for new user experience', 'medium', '{"design","ux"}', 'robert', '2026-02-03', '2026-02-14', 'todo', '{"Created on Feb 3, 2026"}'),
  ('Fix auth token refresh', 'Token silently expires after 30 min causing 401s', 'high', '{"bug","auth"}', 'dev', '2026-02-02', '2026-02-06', 'blocked', '{"Created on Feb 2, 2026","Blocked — waiting on API team"}'),
  ('Write API documentation', 'Document all REST endpoints with examples', 'low', '{"docs"}', 'robert', '2026-01-28', '2026-02-05', 'completed', '{"Created on Jan 28, 2026","Completed on Feb 4, 2026"}'),
  ('Add dark mode support', 'Implement theme toggle with system preference detection', 'low', '{"feature","ui"}', 'dev', null, null, 'todo', '{"Created on Feb 5, 2026"}'),
  ('Optimize route calculation', 'Reduce computation time for 350+ daily routes', 'high', '{"performance","logistics"}', 'robert', '2026-02-04', '2026-02-12', 'working', '{"Created on Feb 4, 2026"}');

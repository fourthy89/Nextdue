-- Nextdue migration: subject code + academic terms
-- Run this ONCE in the Supabase SQL editor for your project (Nextdue).
-- Safe to run on the live database: only adds new nullable columns / a new
-- table, and migrates existing subjects into a starting term. Nothing is
-- deleted, no existing row is dropped.

-- ============ SUBJECTS: add course code column ============
alter table subjects add column if not exists code text;

-- ============ TERMS ============
create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table terms enable row level security;

create policy "terms_select_own" on terms
  for select using (auth.uid() = user_id);
create policy "terms_insert_own" on terms
  for insert with check (auth.uid() = user_id);
create policy "terms_update_own" on terms
  for update using (auth.uid() = user_id);
create policy "terms_delete_own" on terms
  for delete using (auth.uid() = user_id);

-- ============ SUBJECTS: link to a term ============
-- Deleting a term cascades to its subjects, which in turn cascades to
-- schedule_slots and assignments (existing FKs from schema.sql) — so
-- deleting a term removes everything under it in one go.
alter table subjects add column if not exists term_id uuid references terms(id) on delete cascade;

-- ============ MIGRATE EXISTING DATA ============
-- Every user who already has subjects (but no term yet) gets a starting
-- term named "ปี 2 เทอม 1", and their existing subjects move into it.
insert into terms (user_id, name)
select distinct user_id, 'ปี 2 เทอม 1'
from subjects
where term_id is null;

update subjects s
set term_id = t.id
from terms t
where s.user_id = t.user_id
  and t.name = 'ปี 2 เทอม 1'
  and s.term_id is null;

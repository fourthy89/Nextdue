-- Nextdue schema
-- Run this once in the Supabase SQL editor for your project.

-- ============ SUBJECTS ============
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  section text,
  color text not null default 'slate', -- one of: slate, moss, amber, stamp
  created_at timestamptz not null default now()
);

alter table subjects enable row level security;

create policy "subjects_select_own" on subjects
  for select using (auth.uid() = user_id);
create policy "subjects_insert_own" on subjects
  for insert with check (auth.uid() = user_id);
create policy "subjects_update_own" on subjects
  for update using (auth.uid() = user_id);
create policy "subjects_delete_own" on subjects
  for delete using (auth.uid() = user_id);

-- ============ SCHEDULE SLOTS ============
-- One row per recurring class meeting (e.g. Monday 09:00-12:00)
create table if not exists schedule_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  room text,
  created_at timestamptz not null default now()
);

alter table schedule_slots enable row level security;

create policy "slots_select_own" on schedule_slots
  for select using (auth.uid() = user_id);
create policy "slots_insert_own" on schedule_slots
  for insert with check (auth.uid() = user_id);
create policy "slots_update_own" on schedule_slots
  for update using (auth.uid() = user_id);
create policy "slots_delete_own" on schedule_slots
  for delete using (auth.uid() = user_id);

-- ============ ASSIGNMENTS ============
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  title text not null,
  note text,
  due_at timestamptz not null,
  pinned boolean not null default false,
  done boolean not null default false,
  attachment_path text, -- path inside the 'attachments' storage bucket
  created_at timestamptz not null default now()
);

alter table assignments enable row level security;

create policy "assignments_select_own" on assignments
  for select using (auth.uid() = user_id);
create policy "assignments_insert_own" on assignments
  for insert with check (auth.uid() = user_id);
create policy "assignments_update_own" on assignments
  for update using (auth.uid() = user_id);
create policy "assignments_delete_own" on assignments
  for delete using (auth.uid() = user_id);

-- ============ STORAGE ============
-- Create a private bucket for assignment photo/file attachments.
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Files must live under a folder named after the owner's user id:
--   attachments/<user_id>/<filename>
-- This lets the policy check ownership from the path itself.
create policy "attachments_select_own" on storage.objects
  for select using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "attachments_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "attachments_delete_own" on storage.objects
  for delete using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

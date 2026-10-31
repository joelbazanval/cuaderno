-- Pega esto en Supabase → SQL Editor → Run
create table if not exists pages (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  body text not null default '',
  untitled boolean not null default false,
  touched bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, name)
);
create table if not exists settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  enums jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table pages enable row level security;
alter table settings enable row level security;
drop policy if exists "own pages" on pages;
drop policy if exists "own settings" on settings;
create policy "own pages" on pages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

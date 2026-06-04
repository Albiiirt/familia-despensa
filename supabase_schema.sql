-- Run this in your Supabase SQL editor to set up the database

create table if not exists items (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null,
  category     text not null,
  unit         text not null,
  quantity     numeric not null default 0,
  min_quantity numeric not null default 1,
  notes        text,
  is_favorite  boolean not null default false
);

-- Enable realtime
alter publication supabase_realtime add table items;

-- Allow public read/write (family use, no auth required)
alter table items enable row level security;
create policy "allow_all" on items for all using (true) with check (true);

-- supabase/migrations/broadcast_sessions.sql
-- NOTE: Apply manually in the Supabase SQL editor (Dashboard → SQL Editor → Run)

create table if not exists broadcast_sessions (
  code                 text        primary key,
  host_user_id         uuid        not null,
  host_name            text        not null,
  name                 text,                          -- optional e.g. "Friday Night Queue"
  source               text        not null,          -- 'sonos' | 'local' | 'airplay'
  sonos_coordinator_ip text,
  state                text        not null default 'stopped',
  current_track        jsonb,
  queue                jsonb       not null default '[]',
  current_index        int         not null default 0,
  position_sec         float8      not null default 0,
  broadcast_at         timestamptz not null default now(),
  expires_at           timestamptz not null,
  updated_at           timestamptz not null default now()
);

alter table broadcast_sessions enable row level security;

create policy "public_read" on broadcast_sessions
  for select using (true);

create policy "owner_write" on broadcast_sessions
  for all using (auth.uid() = host_user_id)
  with check (auth.uid() = host_user_id);

-- Enable Realtime for this table in Supabase dashboard:
-- Database → Replication → broadcast_sessions ✅

-- pg_cron cleanup (apply separately in Supabase SQL editor):
-- select cron.schedule('cleanup-broadcast-sessions', '*/15 * * * *',
--   $$delete from broadcast_sessions where expires_at < now()$$);

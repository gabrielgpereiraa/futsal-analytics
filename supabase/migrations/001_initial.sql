-- ============================================================
-- Futsal Analytics V0.1 — Initial Schema
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────
create type public.match_status as enum (
  'draft',
  'uploaded',
  'reviewing',
  'completed'
);

create type public.event_type as enum (
  'gol',
  'assistencia',
  'finalizacao',
  'defesa',
  'dividida',
  'falta',
  'recuperacao',
  'perda_de_bola',
  'substituicao',
  'observacao_tatica'
);

create type public.player_position as enum (
  'goleiro',
  'fixo',
  'ala',
  'pivo'
);

-- ─── Tables ──────────────────────────────────────────────────

-- profiles: estende auth.users
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- teams
create table public.teams (
  id               uuid        primary key default uuid_generate_v4(),
  owner_id         uuid        not null references public.profiles(id) on delete cascade,
  name             text        not null,
  abbreviation     text        not null check (char_length(abbreviation) between 1 and 5),
  primary_color    text        not null default '#1d4ed8',
  secondary_color  text        not null default '#ffffff',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- players
create table public.players (
  id             uuid                     primary key default uuid_generate_v4(),
  owner_id       uuid                     not null references public.profiles(id) on delete cascade,
  team_id        uuid                     not null references public.teams(id) on delete cascade,
  name           text                     not null,
  jersey_number  integer                  not null check (jersey_number between 0 and 99),
  position       public.player_position,
  is_active      boolean                  not null default true,
  notes          text,
  created_at     timestamptz              not null default now(),
  updated_at     timestamptz              not null default now()
);

-- matches
create table public.matches (
  id            uuid                  primary key default uuid_generate_v4(),
  owner_id      uuid                  not null references public.profiles(id) on delete cascade,
  team_home_id  uuid                  not null references public.teams(id),
  team_away_id  uuid                  not null references public.teams(id),
  match_date    date                  not null,
  location      text,
  notes         text,
  status        public.match_status   not null default 'draft',
  created_at    timestamptz           not null default now(),
  updated_at    timestamptz           not null default now(),
  constraint different_teams check (team_home_id <> team_away_id)
);

-- match_videos: metadados do vídeo vinculado à partida
create table public.match_videos (
  id                uuid        primary key default uuid_generate_v4(),
  match_id          uuid        not null references public.matches(id) on delete cascade,
  owner_id          uuid        not null references public.profiles(id) on delete cascade,
  storage_path      text        not null,   -- path dentro do bucket
  filename          text        not null,
  file_size_bytes   bigint,
  duration_seconds  numeric,
  fps               numeric     default 30,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- match_events: eventos marcados durante a revisão
create table public.match_events (
  id                   uuid                primary key default uuid_generate_v4(),
  match_id             uuid                not null references public.matches(id) on delete cascade,
  owner_id             uuid                not null references public.profiles(id) on delete cascade,
  timestamp_seconds    numeric             not null check (timestamp_seconds >= 0),
  type                 public.event_type   not null,
  team_id              uuid                references public.teams(id),
  primary_player_id    uuid                references public.players(id),
  secondary_player_id  uuid                references public.players(id),
  notes                text,
  tags                 text[]              not null default '{}',
  created_at           timestamptz         not null default now(),
  updated_at           timestamptz         not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────

create index idx_teams_owner            on public.teams(owner_id);
create index idx_players_owner          on public.players(owner_id);
create index idx_players_team           on public.players(team_id);
create index idx_matches_owner          on public.matches(owner_id);
create index idx_matches_home_team      on public.matches(team_home_id);
create index idx_matches_away_team      on public.matches(team_away_id);
create index idx_match_videos_match     on public.match_videos(match_id);
create index idx_match_events_match     on public.match_events(match_id);
create index idx_match_events_ts        on public.match_events(match_id, timestamp_seconds);
create index idx_match_events_type      on public.match_events(match_id, type);
create index idx_match_events_player    on public.match_events(primary_player_id);

-- ─── Updated-at trigger ──────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.handle_updated_at();

create trigger trg_players_updated_at
  before update on public.players
  for each row execute function public.handle_updated_at();

create trigger trg_matches_updated_at
  before update on public.matches
  for each row execute function public.handle_updated_at();

create trigger trg_match_videos_updated_at
  before update on public.match_videos
  for each row execute function public.handle_updated_at();

create trigger trg_match_events_updated_at
  before update on public.match_events
  for each row execute function public.handle_updated_at();

-- ─── Auto-create profile on signup ───────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Row Level Security ──────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.teams         enable row level security;
alter table public.players       enable row level security;
alter table public.matches       enable row level security;
alter table public.match_videos  enable row level security;
alter table public.match_events  enable row level security;

-- profiles
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- teams
create policy "teams: select own"
  on public.teams for select
  using (auth.uid() = owner_id);

create policy "teams: insert own"
  on public.teams for insert
  with check (auth.uid() = owner_id);

create policy "teams: update own"
  on public.teams for update
  using (auth.uid() = owner_id);

create policy "teams: delete own"
  on public.teams for delete
  using (auth.uid() = owner_id);

-- players
create policy "players: select own"
  on public.players for select
  using (auth.uid() = owner_id);

create policy "players: insert own"
  on public.players for insert
  with check (auth.uid() = owner_id);

create policy "players: update own"
  on public.players for update
  using (auth.uid() = owner_id);

create policy "players: delete own"
  on public.players for delete
  using (auth.uid() = owner_id);

-- matches
create policy "matches: select own"
  on public.matches for select
  using (auth.uid() = owner_id);

create policy "matches: insert own"
  on public.matches for insert
  with check (auth.uid() = owner_id);

create policy "matches: update own"
  on public.matches for update
  using (auth.uid() = owner_id);

create policy "matches: delete own"
  on public.matches for delete
  using (auth.uid() = owner_id);

-- match_videos
create policy "match_videos: select own"
  on public.match_videos for select
  using (auth.uid() = owner_id);

create policy "match_videos: insert own"
  on public.match_videos for insert
  with check (auth.uid() = owner_id);

create policy "match_videos: update own"
  on public.match_videos for update
  using (auth.uid() = owner_id);

create policy "match_videos: delete own"
  on public.match_videos for delete
  using (auth.uid() = owner_id);

-- match_events
create policy "match_events: select own"
  on public.match_events for select
  using (auth.uid() = owner_id);

create policy "match_events: insert own"
  on public.match_events for insert
  with check (auth.uid() = owner_id);

create policy "match_events: update own"
  on public.match_events for update
  using (auth.uid() = owner_id);

create policy "match_events: delete own"
  on public.match_events for delete
  using (auth.uid() = owner_id);

-- ─── Storage bucket ──────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'match-videos',
  'match-videos',
  false,
  5368709120,   -- 5 GB
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
on conflict (id) do nothing;

-- Storage policies: o path deve começar com o uid do usuário
-- ex: {user_id}/{match_id}/{filename}
create policy "storage: insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'match-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: select own"
  on storage.objects for select
  using (
    bucket_id = 'match-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: update own"
  on storage.objects for update
  using (
    bucket_id = 'match-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: delete own"
  on storage.objects for delete
  using (
    bucket_id = 'match-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

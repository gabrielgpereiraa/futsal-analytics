-- ============================================================
-- Futsal Analytics V0.1 — Seed de desenvolvimento
-- Execute após criar o usuário via Supabase Auth
-- Substitua 'YOUR_USER_ID' pelo UUID do usuário criado
-- ============================================================

-- Como encontrar seu user_id:
-- Supabase Dashboard → Authentication → Users → copie o UUID

\set owner_id 'YOUR_USER_ID'

-- ─── Times ───────────────────────────────────────────────────

insert into public.teams (id, owner_id, name, abbreviation, primary_color, secondary_color, notes)
values
  (
    'a1a1a1a1-0000-0000-0000-000000000001',
    :'owner_id',
    'Associação Futsal Azul',
    'AFA',
    '#1d4ed8',
    '#ffffff',
    'Time principal do clube'
  ),
  (
    'a2a2a2a2-0000-0000-0000-000000000002',
    :'owner_id',
    'Esporte Clube Vermelho',
    'ECV',
    '#dc2626',
    '#fbbf24',
    'Time visitante'
  )
on conflict (id) do nothing;

-- ─── Jogadores — Time Azul ───────────────────────────────────

insert into public.players (owner_id, team_id, name, jersey_number, position, is_active)
values
  (:'owner_id', 'a1a1a1a1-0000-0000-0000-000000000001', 'Lucas Goleiro',   1,  'goleiro', true),
  (:'owner_id', 'a1a1a1a1-0000-0000-0000-000000000001', 'Marcos Fixo',     4,  'fixo',    true),
  (:'owner_id', 'a1a1a1a1-0000-0000-0000-000000000001', 'Rafael Ala Dir',  7,  'ala',     true),
  (:'owner_id', 'a1a1a1a1-0000-0000-0000-000000000001', 'Bruno Ala Esq',   10, 'ala',     true),
  (:'owner_id', 'a1a1a1a1-0000-0000-0000-000000000001', 'Diego Pivô',      9,  'pivo',    true),
  (:'owner_id', 'a1a1a1a1-0000-0000-0000-000000000001', 'Felipe Reserva',  15, 'ala',     true)
on conflict do nothing;

-- ─── Jogadores — Time Vermelho ───────────────────────────────

insert into public.players (owner_id, team_id, name, jersey_number, position, is_active)
values
  (:'owner_id', 'a2a2a2a2-0000-0000-0000-000000000002', 'Pedro Goleiro',  1,  'goleiro', true),
  (:'owner_id', 'a2a2a2a2-0000-0000-0000-000000000002', 'João Fixo',      5,  'fixo',    true),
  (:'owner_id', 'a2a2a2a2-0000-0000-0000-000000000002', 'Carlos Ala',     8,  'ala',     true),
  (:'owner_id', 'a2a2a2a2-0000-0000-0000-000000000002', 'André Ala',      11, 'ala',     true),
  (:'owner_id', 'a2a2a2a2-0000-0000-0000-000000000002', 'Gabriel Pivô',   9,  'pivo',    true)
on conflict do nothing;

-- ─── Partida de exemplo ──────────────────────────────────────

insert into public.matches (id, owner_id, team_home_id, team_away_id, match_date, location, status, notes)
values
  (
    'b1b1b1b1-0000-0000-0000-000000000001',
    :'owner_id',
    'a1a1a1a1-0000-0000-0000-000000000001',
    'a2a2a2a2-0000-0000-0000-000000000002',
    current_date,
    'Ginásio Municipal — Quadra 1',
    'draft',
    'Partida de teste para desenvolvimento'
  )
on conflict (id) do nothing;

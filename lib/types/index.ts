import type { Database } from './database'

// ─── Primitivos do banco ──────────────────────────────────────
export type Profile     = Database['public']['Tables']['profiles']['Row']
export type Team        = Database['public']['Tables']['teams']['Row']
export type Player      = Database['public']['Tables']['players']['Row']
export type Match       = Database['public']['Tables']['matches']['Row']
export type MatchVideo  = Database['public']['Tables']['match_videos']['Row']
export type MatchEvent  = Database['public']['Tables']['match_events']['Row']

// ─── Enums ───────────────────────────────────────────────────
export type MatchStatus    = Database['public']['Enums']['match_status']
export type EventType      = Database['public']['Enums']['event_type']
export type PlayerPosition = Database['public']['Enums']['player_position']

// ─── Tipos compostos (com joins) ─────────────────────────────

/** Partida com times embutidos (usado em listagens e revisão) */
export type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

/** Partida completa com vídeo e times */
export type MatchFull = MatchWithTeams & {
  match_videos: MatchVideo[]
}

/** Evento com dados denormalizados para exibição */
export type MatchEventWithRelations = MatchEvent & {
  team: Team | null
  primary_player: Player | null
  secondary_player: Player | null
}

// ─── Labels de exibição ──────────────────────────────────────

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  gol:              'Gol',
  assistencia:      'Assistência',
  finalizacao:      'Finalização',
  defesa:           'Defesa',
  dividida:         'Dividida',
  falta:            'Falta',
  recuperacao:      'Recuperação',
  perda_de_bola:    'Perda de Bola',
  substituicao:     'Substituição',
  observacao_tatica: 'Observação Tática',
}

/** Paleta de cores por tipo de evento — centralizada para uso na timeline, lista e badges */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  gol:               'var(--event-gol)',
  assistencia:       'var(--event-assistencia)',
  finalizacao:       'var(--event-finalizacao)',
  defesa:            'var(--event-defesa)',
  dividida:          'var(--event-dividida)',
  falta:             'var(--event-falta)',
  recuperacao:       'var(--event-recuperacao)',
  perda_de_bola:     'var(--event-perda-de-bola)',
  substituicao:      'var(--event-substituicao)',
  observacao_tatica: 'var(--event-observacao-tatica)',
}

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  draft:      'Rascunho',
  uploaded:   'Vídeo enviado',
  reviewing:  'Em revisão',
  completed:  'Concluída',
}

export const PLAYER_POSITION_LABELS: Record<PlayerPosition, string> = {
  goleiro: 'Goleiro',
  fixo:    'Fixo',
  ala:     'Ala',
  pivo:    'Pivô',
}

/** Mapeamento de hotkey numérica para tipo de evento */
export const HOTKEY_EVENT_MAP: Record<string, EventType> = {
  '1': 'gol',
  '2': 'finalizacao',
  '3': 'defesa',
  '4': 'dividida',
  '5': 'falta',
  '6': 'recuperacao',
  '7': 'perda_de_bola',
}

// ─── Tipos utilitários ────────────────────────────────────────

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

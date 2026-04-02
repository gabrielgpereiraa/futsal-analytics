import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import type { EventType } from '@/lib/types'

type Client = SupabaseClient<Database>

// ─── Tipos de saída ──────────────────────────────────────────

export interface PlayerStatRow {
  player_id:   string
  player_name: string
  jersey_number: number
  team_id:     string
  team_name:   string
  gols:        number
  assistencias: number
  finalizacoes: number
  defesas:     number
  faltas:      number
  recuperacoes: number
  perdas:      number
  total:       number
}

export interface TeamStatRow {
  team_id:    string
  team_name:  string
  gols:       number
  finalizacoes: number
  defesas:    number
  faltas:     number
  recuperacoes: number
  perdas:     number
  total:      number
}

export interface MatchSummary {
  totalEvents:    number
  byType:         Record<EventType, number>
  teamHome:       TeamStatRow
  teamAway:       TeamStatRow
  players:        PlayerStatRow[]
  goalScorers:    PlayerStatRow[]
}

// ─── Helpers internos ────────────────────────────────────────

function zero(): Omit<PlayerStatRow, 'player_id' | 'player_name' | 'jersey_number' | 'team_id' | 'team_name'> {
  return {
    gols:         0,
    assistencias: 0,
    finalizacoes: 0,
    defesas:      0,
    faltas:       0,
    recuperacoes: 0,
    perdas:       0,
    total:        0,
  }
}

function zeroTeam(team_id: string, team_name: string): TeamStatRow {
  return {
    team_id, team_name,
    gols: 0, finalizacoes: 0, defesas: 0,
    faltas: 0, recuperacoes: 0, perdas: 0, total: 0,
  }
}

function incrementType(
  obj: Record<string, number>,
  type: EventType
) {
  obj[type] = (obj[type] ?? 0) + 1
}

// ─── Função principal ────────────────────────────────────────

/**
 * Calcula estatísticas completas de uma partida a partir dos eventos.
 * Executa uma única query e faz a agregação em memória — adequado para V0.1.
 */
export async function getMatchStats(
  supabase: Client,
  matchId: string
): Promise<MatchSummary | null> {
  // Busca partida com times
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id,
      team_home:teams!team_home_id(id, name),
      team_away:teams!team_away_id(id, name)
    `)
    .eq('id', matchId)
    .single()

  if (!match) return null

  const teamHome = match.team_home as unknown as { id: string; name: string }
  const teamAway = match.team_away as unknown as { id: string; name: string }

  // Busca todos os eventos com jogador e time
  const { data: events } = await supabase
    .from('match_events')
    .select(`
      id, type, team_id, timestamp_seconds,
      primary_player:players!primary_player_id(id, name, jersey_number, team_id)
    `)
    .eq('match_id', matchId)
    .order('timestamp_seconds')

  if (!events) return null

  // Mapas de acumulação
  const playerMap = new Map<string, PlayerStatRow>()
  const byType    = {} as Record<EventType, number>

  const teamHomeStats = zeroTeam(teamHome.id, teamHome.name)
  const teamAwayStats = zeroTeam(teamAway.id, teamAway.name)

  for (const ev of events) {
    const type = ev.type as EventType

    // Contagem global por tipo
    byType[type] = (byType[type] ?? 0) + 1

    // Acumulação por time
    const teamStats =
      ev.team_id === teamHome.id ? teamHomeStats :
      ev.team_id === teamAway.id ? teamAwayStats : null

    if (teamStats) {
      teamStats.total++
      incrementTeam(teamStats, type)
    }

    // Acumulação por jogador principal
    const player = ev.primary_player as unknown as {
      id: string; name: string; jersey_number: number; team_id: string
    } | null

    if (player) {
      if (!playerMap.has(player.id)) {
        const teamName =
          player.team_id === teamHome.id ? teamHome.name :
          player.team_id === teamAway.id ? teamAway.name : '—'

        playerMap.set(player.id, {
          player_id:     player.id,
          player_name:   player.name,
          jersey_number: player.jersey_number,
          team_id:       player.team_id,
          team_name:     teamName,
          ...zero(),
        })
      }

      const ps = playerMap.get(player.id)!
      ps.total++
      incrementPlayer(ps, type)
    }
  }

  const players = Array.from(playerMap.values()).sort(
    (a, b) => b.total - a.total
  )

  const goalScorers = players
    .filter((p) => p.gols > 0)
    .sort((a, b) => b.gols - a.gols)

  return {
    totalEvents: events.length,
    byType,
    teamHome:    teamHomeStats,
    teamAway:    teamAwayStats,
    players,
    goalScorers,
  }
}

function incrementPlayer(ps: PlayerStatRow, type: EventType) {
  switch (type) {
    case 'gol':           ps.gols++;          break
    case 'assistencia':   ps.assistencias++;   break
    case 'finalizacao':   ps.finalizacoes++;   break
    case 'defesa':        ps.defesas++;        break
    case 'falta':         ps.faltas++;         break
    case 'recuperacao':   ps.recuperacoes++;   break
    case 'perda_de_bola': ps.perdas++;         break
  }
}

function incrementTeam(ts: TeamStatRow, type: EventType) {
  switch (type) {
    case 'gol':           ts.gols++;          break
    case 'finalizacao':   ts.finalizacoes++;   break
    case 'defesa':        ts.defesas++;        break
    case 'falta':         ts.faltas++;         break
    case 'recuperacao':   ts.recuperacoes++;   break
    case 'perda_de_bola': ts.perdas++;         break
  }
}

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewClient } from './review-client'
import type { MatchEventWithRelations, Team, Player } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Busca partida com times e vídeo
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, status,
      team_home:teams!team_home_id(*),
      team_away:teams!team_away_id(*),
      match_videos(id, storage_path, filename, fps, duration_seconds)
    `)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!match || !match.match_videos?.length) notFound()

  const teamHome = match.team_home as unknown as Team
  const teamAway = match.team_away as unknown as Team

  // Busca jogadores de ambos os times
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .in('team_id', [teamHome.id, teamAway.id])
    .eq('is_active', true)
    .order('jersey_number')

  // Busca eventos já existentes com joins
  const { data: events } = await supabase
    .from('match_events')
    .select(`
      *,
      team:teams(*),
      primary_player:players!primary_player_id(*),
      secondary_player:players!secondary_player_id(*)
    `)
    .eq('match_id', id)
    .order('timestamp_seconds')

  const video = match.match_videos[0]

  return (
    <ReviewClient
      matchId={id}
      userId={user.id}
      teamHome={teamHome}
      teamAway={teamAway}
      players={(players ?? []) as Player[]}
      initialEvents={(events ?? []) as MatchEventWithRelations[]}
      videoMeta={{
        storagePath:     video.storage_path,
        filename:        video.filename,
        fps:             video.fps ?? 30,
        durationSeconds: video.duration_seconds ?? 0,
      }}
    />
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoUploader } from '@/components/matches/video-uploader'
import { MatchStatusBadge } from '@/components/matches/match-status-badge'
import { formatDate, formatFileSize } from '@/lib/utils/format'
import { Play, BarChart2, Upload } from 'lucide-react'
import type { MatchWithTeams, Team } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      team_home:teams!team_home_id(*),
      team_away:teams!team_away_id(*),
      match_videos(*)
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  const teamHome = match.team_home as unknown as Team
  const teamAway = match.team_away as unknown as Team
  const videos   = match.match_videos as Array<{
    id: string; filename: string; file_size_bytes: number | null; fps: number | null
  }>
  const video    = videos?.[0] ?? null
  const hasVideo = !!video

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">
              {teamHome.name} vs {teamAway.name}
            </h1>
            <MatchStatusBadge status={match.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(match.match_date)}
            {match.location ? ` · ${match.location}` : ''}
          </p>
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Mandante', team: teamHome },
          { label: 'Visitante', team: teamAway },
        ].map(({ label, team }) => (
          <Card key={team.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-normal uppercase tracking-wide">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full border border-border flex-shrink-0"
                style={{ backgroundColor: team.primary_color }}
              />
              <div>
                <p className="font-semibold">{team.name}</p>
                <p className="text-sm text-muted-foreground">{team.abbreviation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vídeo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Vídeo da partida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasVideo ? (
            <div className="text-sm space-y-1">
              <p className="font-medium">{video.filename}</p>
              <p className="text-muted-foreground">
                {video.file_size_bytes ? formatFileSize(video.file_size_bytes) : '—'}
                {video.fps ? ` · ${video.fps} fps` : ''}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum vídeo enviado.</p>
          )}

          <VideoUploader matchId={id} existingVideo={video} />
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-3">
        <Button asChild disabled={!hasVideo} className="flex-1">
          <Link href={`/matches/${id}/review`}>
            <Play className="mr-2 h-4 w-4" />
            Iniciar revisão
          </Link>
        </Button>
        <Button asChild variant="outline" disabled={!hasVideo} className="flex-1">
          <Link href={`/matches/${id}/stats`}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Ver estatísticas
          </Link>
        </Button>
      </div>

      {match.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {match.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

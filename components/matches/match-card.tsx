import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MatchStatusBadge } from '@/components/matches/match-status-badge'
import { formatDate } from '@/lib/utils/format'
import { MapPin, Play } from 'lucide-react'
import type { Team, Match } from '@/lib/types'

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
  match_videos?: unknown[]
}

interface MatchCardProps {
  match: MatchWithTeams
}

export function MatchCard({ match }: MatchCardProps) {
  const hasVideo =
    Array.isArray(match.match_videos) && match.match_videos.length > 0

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="h-10 w-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: match.team_home.primary_color }}
        />
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {match.team_home.name}
            <span className="text-muted-foreground mx-2">vs</span>
            {match.team_away.name}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
            <span>{formatDate(match.match_date)}</span>
            {match.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {match.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <MatchStatusBadge status={match.status} />
        {hasVideo && (
          <Button asChild size="sm" variant="ghost">
            <Link href={`/matches/${match.id}/review`}>
              <Play className="h-3.5 w-3.5 mr-1" />
              Revisar
            </Link>
          </Button>
        )}
        <Button asChild size="sm" variant="outline">
          <Link href={`/matches/${match.id}`}>Ver</Link>
        </Button>
      </div>
    </div>
  )
}

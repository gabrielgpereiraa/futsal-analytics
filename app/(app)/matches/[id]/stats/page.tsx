import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMatchStats } from '@/lib/stats/match-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EVENT_TYPE_LABELS, type EventType } from '@/lib/types'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Play } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function StatsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, match_date, location, status,
      team_home:teams!team_home_id(id, name, abbreviation, primary_color),
      team_away:teams!team_away_id(id, name, abbreviation, primary_color)
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  const stats = await getMatchStats(supabase, id)
  if (!stats) notFound()

  const teamHome = match.team_home as unknown as {
    id: string; name: string; abbreviation: string; primary_color: string
  }
  const teamAway = match.team_away as unknown as {
    id: string; name: string; abbreviation: string; primary_color: string
  }

  const statColumns: Array<{ key: keyof typeof stats.teamHome; label: string }> = [
    { key: 'gols',         label: 'Gols' },
    { key: 'finalizacoes', label: 'Finalizações' },
    { key: 'defesas',      label: 'Defesas' },
    { key: 'faltas',       label: 'Faltas' },
    { key: 'recuperacoes', label: 'Recuperações' },
    { key: 'perdas',       label: 'Perdas' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/matches/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {teamHome.name} vs {teamAway.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(match.match_date)}
              {match.location ? ` · ${match.location}` : ''}
            </p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={`/matches/${id}/review`}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Revisão
          </Link>
        </Button>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Total de eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Gols {teamHome.abbreviation}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: teamHome.primary_color }}>
              {stats.teamHome.gols}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Gols {teamAway.abbreviation}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: teamAway.primary_color }}>
              {stats.teamAway.gols}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo por time */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo por time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="text-left py-2 px-3 font-medium"
                    style={{ color: teamHome.primary_color }}
                  >
                    {teamHome.abbreviation}
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Estatística
                  </th>
                  <th
                    className="text-right py-2 px-3 font-medium"
                    style={{ color: teamAway.primary_color }}
                  >
                    {teamAway.abbreviation}
                  </th>
                </tr>
              </thead>
              <tbody>
                {statColumns.map(({ key, label }) => {
                  const h = stats.teamHome[key] as number
                  const a = stats.teamAway[key] as number
                  return (
                    <tr key={key} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 px-3 font-semibold text-left">{h}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">{label}</td>
                      <td className="py-2.5 px-3 font-semibold text-right">{a}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Artilheiros */}
      {stats.goalScorers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Artilheiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.goalScorers.map((p, i) => (
                <div key={p.player_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground w-4">{i + 1}</span>
                    <span className="font-medium">
                      #{p.jersey_number} {p.player_name}
                    </span>
                    <Badge variant="outline" className="text-xs">{p.team_name}</Badge>
                  </div>
                  <Badge className="min-w-[2rem] justify-center">{p.gols}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas por jogador */}
      {stats.players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas por jogador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2 px-2 font-medium">Jogador</th>
                    <th className="text-left py-2 px-2 font-medium">Time</th>
                    <th className="text-center py-2 px-2 font-medium">G</th>
                    <th className="text-center py-2 px-2 font-medium">A</th>
                    <th className="text-center py-2 px-2 font-medium">Fin</th>
                    <th className="text-center py-2 px-2 font-medium">Def</th>
                    <th className="text-center py-2 px-2 font-medium">Flt</th>
                    <th className="text-center py-2 px-2 font-medium">Rec</th>
                    <th className="text-center py-2 px-2 font-medium">Prd</th>
                    <th className="text-center py-2 px-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.players.map((p) => (
                    <tr
                      key={p.player_id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2 px-2 font-medium">
                        <span className="font-mono text-muted-foreground mr-1">
                          #{p.jersey_number}
                        </span>
                        {p.player_name}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{p.team_name}</td>
                      <td className="py-2 px-2 text-center">{p.gols || '—'}</td>
                      <td className="py-2 px-2 text-center">{p.assistencias || '—'}</td>
                      <td className="py-2 px-2 text-center">{p.finalizacoes || '—'}</td>
                      <td className="py-2 px-2 text-center">{p.defesas || '—'}</td>
                      <td className="py-2 px-2 text-center">{p.faltas || '—'}</td>
                      <td className="py-2 px-2 text-center">{p.recuperacoes || '—'}</td>
                      <td className="py-2 px-2 text-center">{p.perdas || '—'}</td>
                      <td className="py-2 px-2 text-center font-semibold">{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              G=Gols · A=Assistências · Fin=Finalizações · Def=Defesas ·
              Flt=Faltas · Rec=Recuperações · Prd=Perdas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Distribuição por tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
              >
                <span className="text-sm">
                  {EVENT_TYPE_LABELS[type as EventType] ?? type}
                </span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

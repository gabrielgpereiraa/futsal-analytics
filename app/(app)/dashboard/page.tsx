import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserCircle2, Clapperboard, PlusCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { MATCH_STATUS_LABELS } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [teamsResult, playersResult, matchesResult] = await Promise.all([
    supabase.from('teams').select('id', { count: 'exact', head: true }),
    supabase.from('players').select('id', { count: 'exact', head: true }),
    supabase
      .from('matches')
      .select('id, match_date, status, team_home:teams!team_home_id(name), team_away:teams!team_away_id(name)')
      .order('match_date', { ascending: false })
      .limit(5),
  ])

  const totalTeams   = teamsResult.count   ?? 0
  const totalPlayers = playersResult.count ?? 0
  const recentMatches = matchesResult.data ?? []

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
          <CardDescription className="mt-1">Visão geral da sua atividade</CardDescription>
        </CardHeader>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Times</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalTeams}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jogadores</CardTitle>
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalPlayers}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Partidas</CardTitle>
            <Clapperboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{matchesResult.count ?? 0}</span>
          </CardContent>
        </Card>
      </div>

      {/* Partidas recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Partidas recentes</CardTitle>
            <CardDescription>Últimas 5 partidas cadastradas</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/matches/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova partida
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <CardDescription className="text-muted-foreground text-sm">
              Nenhuma partida cadastrada ainda.{' '}
              <Link href="/matches/new" className="text-primary underline-offset-4 hover:underline">
                Criar primeira partida
              </Link>
            </CardDescription>
          ) : (
            <div className="space-y-2">
              {recentMatches.map((match) => {
                // Supabase retorna joins como objetos
                const home = match.team_home as unknown as { name: string } | null
                const away = match.team_away as unknown as { name: string } | null

                return (
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto rounded-md hover:bg-muted transition-colors"
                    key={match.id}
                  >
                    <Link href={`/matches/${match.id}`} className="flex items-center w-full justify-between">
                      <span className="font-medium">
                        {home?.name ?? '—'} vs {away?.name ?? '—'}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(match.match_date)}
                        </span>
                        <Badge variant="secondary">
                          {MATCH_STATUS_LABELS[match.status]}
                        </Badge>
                      </span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

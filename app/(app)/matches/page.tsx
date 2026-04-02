import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MatchCard } from '@/components/matches/match-card'
import { PlusCircle } from 'lucide-react'
import type { MatchWithTeams } from '@/lib/types'

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      team_home:teams!team_home_id(*),
      team_away:teams!team_away_id(*),
      match_videos(id)
    `)
    .order('match_date', { ascending: false })

  // Supabase retorna joins como objetos aninhados — cast seguro aqui
  const matches = (data ?? []) as unknown as (MatchWithTeams & {
    match_videos: { id: string }[]
  })[]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partidas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {matches.length} partida{matches.length !== 1 ? 's' : ''} cadastrada{matches.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/matches/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova partida
          </Link>
        </Button>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-12 text-center">
          <p className="text-muted-foreground">Nenhuma partida cadastrada.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/matches/new">Criar primeira partida</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

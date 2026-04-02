import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PlayerTable } from '@/components/players/player-table'
import { PlusCircle } from 'lucide-react'

export default async function PlayersPage() {
  const supabase = await createClient()

  const { data: players } = await supabase
    .from('players')
    .select('*, team:teams(id, name, abbreviation, primary_color)')
    .order('name')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jogadores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {players?.length ?? 0} jogador(es) cadastrado(s)
          </p>
        </div>
        <Button asChild>
          <Link href="/players/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo jogador
          </Link>
        </Button>
      </div>

      {!players || players.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-12 text-center">
          <p className="text-muted-foreground">Nenhum jogador cadastrado.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/players/new">Cadastrar primeiro jogador</Link>
          </Button>
        </div>
      ) : (
        <PlayerTable players={players} />
      )}
    </div>
  )
}

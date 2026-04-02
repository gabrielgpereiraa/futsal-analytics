import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TeamCard } from '@/components/teams/team-card'
import { PlusCircle } from 'lucide-react'

export default async function TeamsPage() {
  const supabase = await createClient()
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('name')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Times</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {teams?.length ?? 0} time(s) cadastrado(s)
          </p>
        </div>
        <Button asChild>
          <Link href="/teams/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo time
          </Link>
        </Button>
      </div>

      {!teams || teams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-12 text-center">
          <p className="text-muted-foreground">Nenhum time cadastrado.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/teams/new">Cadastrar primeiro time</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}

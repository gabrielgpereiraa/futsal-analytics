import { createClient } from '@/lib/supabase/server'
import { MatchForm } from '@/components/matches/match-form'

export default async function NewMatchPage() {
  const supabase = await createClient()
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, abbreviation')
    .order('name')

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Nova partida</h1>
      <MatchForm teams={teams ?? []} />
    </div>
  )
}

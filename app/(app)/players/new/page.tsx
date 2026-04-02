import { createClient } from '@/lib/supabase/server'
import { PlayerForm } from '@/components/players/player-form'

export default async function NewPlayerPage() {
  const supabase = await createClient()
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .order('name')

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Novo jogador</h1>
      <PlayerForm teams={teams ?? []} />
    </div>
  )
}

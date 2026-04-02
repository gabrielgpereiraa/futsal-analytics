import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayerForm } from '@/components/players/player-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPlayerPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: player }, { data: teams }] = await Promise.all([
    supabase.from('players').select('*').eq('id', id).single(),
    supabase.from('teams').select('id, name').order('name'),
  ])

  if (!player) notFound()

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Editar jogador</h1>
      <PlayerForm player={player} teams={teams ?? []} />
    </div>
  )
}

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamForm } from '@/components/teams/team-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTeamPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (!team) notFound()

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Editar time</h1>
      <TeamForm team={team} />
    </div>
  )
}

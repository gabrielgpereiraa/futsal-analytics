import { TeamForm } from '@/components/teams/team-form'

export default function NewTeamPage() {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Novo time</h1>
      <TeamForm />
    </div>
  )
}

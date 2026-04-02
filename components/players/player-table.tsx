import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { PLAYER_POSITION_LABELS } from '@/lib/types'
import type { Player } from '@/lib/types'

type PlayerWithTeam = Player & {
  team: { id: string; name: string; abbreviation: string; primary_color: string } | null
}

interface PlayerTableProps {
  players: PlayerWithTeam[]
}

export function PlayerTable({ players }: PlayerTableProps) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Posição</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr
              key={player.id}
              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 font-mono text-muted-foreground">
                {player.jersey_number}
              </td>
              <td className="px-4 py-3 font-medium">{player.name}</td>
              <td className="px-4 py-3">
                {player.team ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.team.primary_color }}
                    />
                    <span className="text-muted-foreground">
                      {player.team.abbreviation}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {player.position
                  ? PLAYER_POSITION_LABELS[player.position]
                  : '—'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={player.is_active ? 'default' : 'secondary'}>
                  {player.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                  <Link href={`/players/${player.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Editar</span>
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

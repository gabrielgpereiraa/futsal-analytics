import Link from 'next/link'
import type { Team } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="group relative">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {/* Color swatch */}
          <div className="flex gap-1 flex-shrink-0">
            <div
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: team.primary_color }}
            />
            <div
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: team.secondary_color }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{team.name}</p>
            <p className="text-xs text-muted-foreground">{team.abbreviation}</p>
          </div>
        </div>
      </CardHeader>

      {team.notes && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">{team.notes}</p>
        </CardContent>
      )}

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button asChild variant="ghost" size="icon" className="h-7 w-7">
          <Link href={`/teams/${team.id}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Editar {team.name}</span>
          </Link>
        </Button>
      </div>
    </Card>
  )
}

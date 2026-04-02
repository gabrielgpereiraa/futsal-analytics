'use client'

import { useMemo, useState } from 'react'
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  type EventType,
  type MatchEventWithRelations,
  type Team,
} from '@/lib/types'
import { formatSeconds } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2, Search } from 'lucide-react'

const EVENT_FALLBACK_COLOR = 'var(--event-observacao-tatica)'

interface EventListProps {
  events:        MatchEventWithRelations[]
  teams:         Team[]
  selectedId:    string | null
  onSelect:      (event: MatchEventWithRelations) => void
  onDelete:      (id: string) => Promise<void>
  onSeek:        (seconds: number) => void
}

export function EventList({
  events,
  teams,
  selectedId,
  onSelect,
  onDelete,
  onSeek,
}: EventListProps) {
  const [filterType,   setFilterType]   = useState<EventType | 'all'>('all')
  const [filterTeam,   setFilterTeam]   = useState<string>('all')
  const [filterSearch, setFilterSearch] = useState('')

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (filterType !== 'all' && ev.type !== filterType) return false
      if (filterTeam !== 'all' && ev.team_id !== filterTeam) return false
      if (filterSearch) {
        const q = filterSearch.toLowerCase()
        const matchesName =
          ev.primary_player?.name.toLowerCase().includes(q) ||
          ev.secondary_player?.name.toLowerCase().includes(q) ||
          ev.notes?.toLowerCase().includes(q)
        if (!matchesName) return false
      }
      return true
    })
  }, [events, filterType, filterTeam, filterSearch])

  return (
    <div className="flex flex-col h-full">
      {/* Filtros */}
      <div className="space-y-2 pb-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Buscar jogador ou nota..."
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as EventType | 'all')}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterTeam}
            onValueChange={setFilterTeam}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os times</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} de {events.length} eventos
        </p>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-0.5">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Nenhum evento encontrado.
          </p>
        ) : (
          filtered.map((ev) => {
            const color     = EVENT_TYPE_COLORS[ev.type] ?? EVENT_FALLBACK_COLOR
            const isSelected = ev.id === selectedId

            return (
              <div
                key={ev.id}
                className={`group flex items-start gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  onSeek(ev.timestamp_seconds)
                  onSelect(ev)
                }}
              >
                {/* Color dot */}
                <div
                  className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium truncate">
                      {EVENT_TYPE_LABELS[ev.type]}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground flex-shrink-0">
                      {formatSeconds(ev.timestamp_seconds)}
                    </span>
                  </div>

                  {ev.primary_player && (
                    <p className="text-xs text-muted-foreground truncate">
                      #{ev.primary_player.jersey_number} {ev.primary_player.name}
                      {ev.secondary_player && (
                        <> → #{ev.secondary_player.jersey_number} {ev.secondary_player.name}</>
                      )}
                    </p>
                  )}

                  {ev.notes && (
                    <p className="text-xs text-muted-foreground/70 italic truncate">
                      {ev.notes}
                    </p>
                  )}
                </div>

                {/* Ações — visíveis ao hover ou selecionado */}
                <div
                  className={`flex gap-0.5 flex-shrink-0 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); onSelect(ev) }}
                    title="Editar"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                        title="Excluir"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {EVENT_TYPE_LABELS[ev.type]} em {formatSeconds(ev.timestamp_seconds)}.
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(ev.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

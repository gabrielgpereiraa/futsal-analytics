'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { useVideoPlayer } from '@/hooks/use-video-player'
import { useMatchEvents } from '@/hooks/use-match-events'
import { useToast } from '@/hooks/use-toast'
import { VideoPlayer } from '@/components/review/video-player'
import { EventTimeline } from '@/components/review/event-timeline'
import { EventForm } from '@/components/review/event-form'
import { EventList } from '@/components/review/event-list'
import { HotkeyHint } from '@/components/review/hotkey-hint'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Keyboard } from 'lucide-react'
import {
  HOTKEY_EVENT_MAP,
  type EventType,
  type MatchEventWithRelations,
  type Player,
  type Team,
} from '@/lib/types'
import type { MatchEventFormValues } from '@/lib/schemas/event.schema'

interface VideoMeta {
  storagePath:     string
  filename:        string
  fps:             number
  durationSeconds: number
}

interface ReviewClientProps {
  matchId:       string
  userId:        string
  teamHome:      Team
  teamAway:      Team
  players:       Player[]
  initialEvents: MatchEventWithRelations[]
  videoMeta:     VideoMeta
}

export function ReviewClient({
  matchId,
  userId,
  teamHome,
  teamAway,
  players,
  initialEvents,
  videoMeta,
}: ReviewClientProps) {
  const { toast } = useToast()

  const [videoUrl,      setVideoUrl]      = useState('')
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null)
  const [pendingType,   setPendingType]   = useState<EventType | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MatchEventWithRelations | null>(null)
  const [activeHotkey,  setActiveHotkey]  = useState<EventType | null>(null)
  const [showHotkeyRef, setShowHotkeyRef] = useState(false)

  const triggerFormSubmit = useRef<(() => void) | null>(null)

  useEffect(() => {
    fetch(`/api/matches/${matchId}/video-url`)
      .then((r) => r.json() as Promise<{ url?: string; error?: string }>)
      .then((data) => {
        if (data.url) setVideoUrl(data.url)
        else setVideoUrlError(data.error ?? 'Erro ao carregar vídeo')
      })
      .catch(() => setVideoUrlError('Erro de rede ao carregar vídeo'))
  }, [matchId])

  const player = useVideoPlayer({ fps: videoMeta.fps })

  const {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    undoLast,
  } = useMatchEvents({ matchId, ownerId: userId, initial: initialEvents })

  const teams = useMemo(() => [teamHome, teamAway], [teamHome, teamAway])

  const handleSaveEvent = useCallback(
    async (values: MatchEventFormValues) => {
      if (selectedEvent) {
        const ok = await updateEvent(selectedEvent.id, {
          type:                values.type,
          team_id:             values.team_id,
          primary_player_id:   values.primary_player_id,
          secondary_player_id: values.secondary_player_id,
          notes:               values.notes,
          tags:                values.tags,
        })
        if (ok) {
          toast({ title: 'Evento atualizado' })
          setSelectedEvent(null)
          setPendingType(null)
        } else {
          toast({ title: 'Erro ao atualizar', variant: 'destructive' })
        }
        return
      }

      const created = await createEvent({
        timestamp_seconds:   values.timestamp_seconds,
        type:                values.type,
        team_id:             values.team_id,
        primary_player_id:   values.primary_player_id,
        secondary_player_id: values.secondary_player_id,
        notes:               values.notes,
        tags:                values.tags,
      })

      if (created) {
        toast({
          title:       'Evento salvo',
          description: `${values.type} — ${Math.floor(values.timestamp_seconds)}s`,
        })
        setPendingType(null)
      } else {
        toast({ title: 'Erro ao salvar evento', variant: 'destructive' })
      }
    },
    [selectedEvent, createEvent, updateEvent, toast]
  )

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      const ok = await deleteEvent(id)
      if (ok) {
        toast({ title: 'Evento excluído' })
        if (selectedEvent?.id === id) setSelectedEvent(null)
      } else {
        toast({ title: 'Erro ao excluir', variant: 'destructive' })
      }
    },
    [deleteEvent, selectedEvent, toast]
  )

  const handleSelectEvent = useCallback((ev: MatchEventWithRelations) => {
    setSelectedEvent(ev)
    setPendingType(null)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedEvent(null)
    setPendingType(null)
  }, [])

  const handleRegisterSubmit = useCallback((fn: () => void) => {
    triggerFormSubmit.current = fn
  }, [])

  const togglePlay    = player.togglePlay
  const seekRelative  = player.seekRelative
  const stepFrame     = player.stepFrame
  const pause         = player.pause
  const isPlaying     = player.isPlaying

  const hotkeyBindings = useMemo(
    () => [
      {
        key: 'Space', useCode: true as const,
        handler: (e: KeyboardEvent) => { e.preventDefault(); togglePlay() },
      },
      {
        key: 'j',
        handler: (e: KeyboardEvent) => { e.preventDefault(); seekRelative(-2) },
      },
      {
        key: 'l',
        handler: (e: KeyboardEvent) => { e.preventDefault(); seekRelative(2) },
      },
      {
        key: ',',
        handler: (e: KeyboardEvent) => { e.preventDefault(); stepFrame(-1) },
      },
      {
        key: '.',
        handler: (e: KeyboardEvent) => { e.preventDefault(); stepFrame(1) },
      },
      ...Object.entries(HOTKEY_EVENT_MAP).map(([key, type]) => ({
        key,
        handler: (e: KeyboardEvent) => {
          e.preventDefault()
          if (isPlaying) pause()
          setPendingType(type)
          setSelectedEvent(null)
          setActiveHotkey(type)
          setTimeout(() => setActiveHotkey(null), 50)
        },
      })),
      {
        key: 'Enter',
        handler: (e: KeyboardEvent) => {
          e.preventDefault()
          triggerFormSubmit.current?.()
        },
      },
      {
        key: 'Backspace',
        handler: (e: KeyboardEvent) => {
          e.preventDefault()
          void undoLast().then((ok) => {
            if (ok) toast({ title: 'Último evento removido' })
          })
        },
      },
    ],
    [togglePlay, seekRelative, stepFrame, pause, isPlaying, undoLast, toast]
  )

  useHotkeys(hotkeyBindings)

  return (
    <div className="flex flex-col h-svh overflow-hidden bg-background">

      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/matches/${matchId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {teamHome.name}
              <span className="text-muted-foreground mx-2 font-normal">vs</span>
              {teamAway.name}
            </p>
            <p className="text-xs text-muted-foreground">{videoMeta.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {events.length} evento{events.length !== 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => setShowHotkeyRef((v) => !v)}
          >
            <Keyboard className="mr-1.5 h-3.5 w-3.5" />
            Hotkeys
          </Button>
        </div>
      </header>

      {showHotkeyRef && (
        <div className="flex-shrink-0 bg-card border-b border-border px-4 py-2">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            {(
              [
                ['Space', 'Play/Pause'], ['J', '−2s'],        ['L', '+2s'],
                [',',     'Frame −1'],   ['.',  'Frame +1'],
                ['1',     'Gol'],        ['2',  'Finalização'], ['3', 'Defesa'],
                ['4',     'Dividida'],   ['5',  'Falta'],       ['6', 'Recuperação'],
                ['7',     'Perda'],      ['Enter', 'Salvar'],   ['⌫', 'Desfazer'],
              ] as [string, string][]
            ).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border">
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden p-4 gap-4">
          {videoUrlError ? (
            <div className="flex-1 flex items-center justify-center rounded-lg border border-border">
              <p className="text-sm text-destructive">{videoUrlError}</p>
            </div>
          ) : (
            <VideoPlayer videoUrl={videoUrl} {...player} />
          )}

          <EventTimeline
            events={events}
            duration={player.duration > 0 ? player.duration : videoMeta.durationSeconds}
            currentTime={player.currentTime}
            onSeek={player.seekTo}
            onSelect={handleSelectEvent}
          />
        </div>

        <Separator orientation="vertical" />

        <aside className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-border">
            <EventForm
              currentTime={player.currentTime}
              teams={teams}
              players={players}
              selectedEvent={selectedEvent}
              pendingType={pendingType}
              isLoading={isLoading}
              onSave={handleSaveEvent}
              onClear={clearSelection}
              onRegisterSubmit={handleRegisterSubmit}
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-4 gap-3">
            <p className="flex-shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Eventos marcados
            </p>
            <div className="flex-1 overflow-hidden">
              <EventList
                events={events}
                teams={teams}
                selectedId={selectedEvent?.id ?? null}
                onSelect={handleSelectEvent}
                onDelete={handleDeleteEvent}
                onSeek={player.seekTo}
              />
            </div>
          </div>
        </aside>
      </div>

      <HotkeyHint activeType={activeHotkey} />
    </div>
  )
}

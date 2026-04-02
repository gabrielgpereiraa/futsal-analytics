'use client'

import { useCallback } from 'react'
import type { MatchEventWithRelations } from '@/lib/types'
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/types'
import { formatSeconds } from '@/lib/utils/format'

const EVENT_FALLBACK_COLOR = 'var(--event-observacao-tatica)'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface EventTimelineProps {
  events:      MatchEventWithRelations[]
  duration:    number
  currentTime: number
  onSeek:      (seconds: number) => void
  onSelect:    (event: MatchEventWithRelations) => void
}

export function EventTimeline({
  events,
  duration,
  currentTime,
  onSeek,
  onSelect,
}: EventTimelineProps) {
  const safeD = duration > 0 ? duration : 1

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const pct  = (e.clientX - rect.left) / rect.width
      onSeek(pct * duration)
    },
    [duration, onSeek]
  )

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <span>00:00</span>
          <span className="font-medium">{events.length} evento(s)</span>
          <span>{formatSeconds(duration)}</span>
        </div>

        {/* Track clicável */}
        <div
          className="relative h-8 bg-muted rounded cursor-pointer select-none"
          onClick={handleTrackClick}
          role="slider"
          aria-label="Timeline de eventos"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
        >
          {/* Posição atual */}
          <div
            className="absolute top-0 h-full w-0.5 bg-primary z-10 pointer-events-none transition-[left] duration-100"
            style={{ left: `${(currentTime / safeD) * 100}%` }}
          />

          {/* Marcadores de evento */}
          {events.map((ev) => {
            const leftPct = (ev.timestamp_seconds / safeD) * 100
            const color   = EVENT_TYPE_COLORS[ev.type] ?? EVENT_FALLBACK_COLOR

            return (
              <Tooltip key={ev.id}>
                <TooltipTrigger asChild>
                  <button
                    className="absolute top-0 h-full w-1 rounded-sm hover:w-1.5 transition-all z-20"
                    style={{
                      left:            `${leftPct}%`,
                      backgroundColor: color,
                      transform:       'translateX(-50%)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSeek(ev.timestamp_seconds)
                      onSelect(ev)
                    }}
                    aria-label={`${EVENT_TYPE_LABELS[ev.type]} em ${formatSeconds(ev.timestamp_seconds)}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs space-y-0.5">
                  <p className="font-medium" style={{ color }}>
                    {EVENT_TYPE_LABELS[ev.type]}
                  </p>
                  <p className="text-muted-foreground">
                    {formatSeconds(ev.timestamp_seconds)}
                  </p>
                  {ev.primary_player && (
                    <p>{ev.primary_player.name} #{ev.primary_player.jersey_number}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Legenda de cores */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-muted-foreground">
                {EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

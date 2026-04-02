'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchEvent, EventType, MatchEventWithRelations } from '@/lib/types'

interface UseMatchEventsOptions {
  matchId:  string
  ownerId:  string
  initial:  MatchEventWithRelations[]
}

interface CreateEventPayload {
  timestamp_seconds:   number
  type:                EventType
  team_id?:            string | null
  primary_player_id?:  string | null
  secondary_player_id?: string | null
  notes?:              string | null
  tags?:               string[]
}

interface UpdateEventPayload {
  type?:               EventType
  team_id?:            string | null
  primary_player_id?:  string | null
  secondary_player_id?: string | null
  notes?:              string | null
  tags?:               string[]
}

export function useMatchEvents({
  matchId,
  ownerId,
  initial,
}: UseMatchEventsOptions) {
  const [events, setEvents] = useState<MatchEventWithRelations[]>(initial)
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const supabase = createClient()

  const createEvent = useCallback(
    async (payload: CreateEventPayload): Promise<MatchEvent | null> => {
      setIsLoading(true)
      setLastError(null)

      const { data, error } = await supabase
        .from('match_events')
        .insert({
          match_id:            matchId,
          owner_id:            ownerId,
          timestamp_seconds:   payload.timestamp_seconds,
          type:                payload.type,
          team_id:             payload.team_id            ?? null,
          primary_player_id:   payload.primary_player_id  ?? null,
          secondary_player_id: payload.secondary_player_id ?? null,
          notes:               payload.notes              ?? null,
          tags:                payload.tags               ?? [],
        })
        .select(`
          *,
          team:teams(*),
          primary_player:players!primary_player_id(*),
          secondary_player:players!secondary_player_id(*)
        `)
        .single()

      setIsLoading(false)

      if (error) {
        setLastError(error.message)
        return null
      }

      // Otimista: insere em ordem por timestamp
      setEvents((prev) => {
        const next = [...prev, data as MatchEventWithRelations]
        return next.sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
      })

      return data as MatchEvent
    },
    [matchId, ownerId, supabase]
  )

  const updateEvent = useCallback(
    async (id: string, payload: UpdateEventPayload): Promise<boolean> => {
      setIsLoading(true)
      setLastError(null)

      const { data, error } = await supabase
        .from('match_events')
        .update(payload)
        .eq('id', id)
        .eq('owner_id', ownerId)
        .select(`
          *,
          team:teams(*),
          primary_player:players!primary_player_id(*),
          secondary_player:players!secondary_player_id(*)
        `)
        .single()

      setIsLoading(false)

      if (error) {
        setLastError(error.message)
        return false
      }

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === id ? (data as MatchEventWithRelations) : ev
        )
      )

      return true
    },
    [ownerId, supabase]
  )

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true)
      setLastError(null)

      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', id)
        .eq('owner_id', ownerId)

      setIsLoading(false)

      if (error) {
        setLastError(error.message)
        return false
      }

      setEvents((prev) => prev.filter((ev) => ev.id !== id))
      return true
    },
    [ownerId, supabase]
  )

  /** Desfaz o último evento criado (apenas se criado há menos de 10 segundos) */
  const undoLast = useCallback(async (): Promise<boolean> => {
    const last = events[events.length - 1]
    if (!last) return false

    const age = Date.now() - new Date(last.created_at).getTime()
    if (age > 10_000) return false // mais de 10 s: não desfaz

    return deleteEvent(last.id)
  }, [events, deleteEvent])

  return {
    events,
    isLoading,
    lastError,
    createEvent,
    updateEvent,
    deleteEvent,
    undoLast,
  }
}

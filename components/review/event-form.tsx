'use client'

import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { matchEventSchema, type MatchEventFormValues } from '@/lib/schemas/event.schema'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  EVENT_TYPE_LABELS,
  HOTKEY_EVENT_MAP,
  type EventType,
  type Team,
  type Player,
  type MatchEventWithRelations,
} from '@/lib/types'
import { formatSeconds } from '@/lib/utils/format'
import { Loader2, Save } from 'lucide-react'

interface EventFormProps {
  currentTime:      number
  teams:            Team[]
  players:          Player[]
  selectedEvent:    MatchEventWithRelations | null
  pendingType:      EventType | null
  isLoading:        boolean
  onSave:           (values: MatchEventFormValues) => void
  onClear:          () => void
  /**
   * O form chama isso na montagem para registrar sua função de submit
   * no ReviewClient. Isso permite que o hotkey Enter dispare o submit
   * sem precisar de IDs de DOM ou refs de elemento.
   */
  onRegisterSubmit: (fn: () => void) => void
}

export function EventForm({
  currentTime,
  teams,
  players,
  selectedEvent,
  pendingType,
  isLoading,
  onSave,
  onClear,
  onRegisterSubmit,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MatchEventFormValues>({
    resolver: zodResolver(matchEventSchema),
    defaultValues: {
      timestamp_seconds:   currentTime,
      type:                undefined,
      team_id:             null,
      primary_player_id:   null,
      secondary_player_id: null,
      notes:               '',
      tags:                [],
    },
  })

  const watchedType    = watch('type')
  const watchedTeamId  = watch('team_id')
  const watchedTs      = watch('timestamp_seconds')

  // Registra a função de submit no pai para uso via hotkey Enter
  const submitFn = useCallback(() => {
    void handleSubmit(onSave)()
  }, [handleSubmit, onSave])

  useEffect(() => {
    onRegisterSubmit(submitFn)
  }, [onRegisterSubmit, submitFn])

  // Quando o tipo pendente muda (hotkey), atualiza o form e o timestamp
  useEffect(() => {
    if (pendingType) {
      setValue('type', pendingType)
      setValue('timestamp_seconds', currentTime)
    }
  }, [pendingType, currentTime, setValue])

  // Quando seleciona evento para editar, carrega seus dados
  useEffect(() => {
    if (selectedEvent) {
      reset({
        timestamp_seconds:   selectedEvent.timestamp_seconds,
        type:                selectedEvent.type,
        team_id:             selectedEvent.team_id,
        primary_player_id:   selectedEvent.primary_player_id,
        secondary_player_id: selectedEvent.secondary_player_id,
        notes:               selectedEvent.notes ?? '',
        tags:                selectedEvent.tags,
      })
    }
  }, [selectedEvent, reset])

  // Filtra jogadores pelo time selecionado (ou todos ativos)
  const filteredPlayers = watchedTeamId
    ? players.filter((p) => p.team_id === watchedTeamId && p.is_active)
    : players.filter((p) => p.is_active)

  function onSubmit(values: MatchEventFormValues) {
    onSave(values)
    reset({
      timestamp_seconds:   currentTime,
      type:                undefined,
      team_id:             null,
      primary_player_id:   null,
      secondary_player_id: null,
      notes:               '',
      tags:                [],
    })
  }

  const isEditing = !!selectedEvent

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {isEditing ? 'Editar evento' : 'Novo evento'}
        </h3>
        {(isEditing || pendingType) && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
        <span className="text-xs text-muted-foreground">Momento</span>
        <span className="font-mono text-sm font-medium tabular-nums">
          {formatSeconds(watchedTs ?? currentTime)}
        </span>
      </div>

      {/* Tipo de evento */}
      <div className="space-y-1">
        <Label className="text-xs">Tipo *</Label>
        <Select
          value={watchedType ?? ''}
          onValueChange={(v) => setValue('type', v as EventType)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Selecione ou pressione 1–7" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => {
              const hotkey = Object.entries(HOTKEY_EVENT_MAP).find(
                ([, t]) => t === value
              )?.[0]
              return (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    {label}
                    {hotkey && (
                      <span className="text-xs text-muted-foreground font-mono">
                        [{hotkey}]
                      </span>
                    )}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-xs text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Time */}
      <div className="space-y-1">
        <Label className="text-xs">Time</Label>
        <Select
          value={watchedTeamId ?? ''}
          onValueChange={(v) => {
            setValue('team_id', v || null)
            setValue('primary_player_id', null)
            setValue('secondary_player_id', null)
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Nenhum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jogador principal */}
      <div className="space-y-1">
        <Label className="text-xs">Jogador principal</Label>
        <Select
          value={watch('primary_player_id') ?? ''}
          onValueChange={(v) => setValue('primary_player_id', v || null)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Nenhum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {filteredPlayers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                #{p.jersey_number} {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jogador secundário */}
      <div className="space-y-1">
        <Label className="text-xs">Jogador secundário</Label>
        <Select
          value={watch('secondary_player_id') ?? ''}
          onValueChange={(v) => setValue('secondary_player_id', v || null)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Nenhum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {filteredPlayers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                #{p.jersey_number} {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notas */}
      <div className="space-y-1">
        <Label className="text-xs">Notas</Label>
        <Textarea
          {...register('notes')}
          rows={2}
          placeholder="Observação rápida..."
          className="text-sm resize-none"
        />
      </div>

      {/* Botão salvar */}
      <Button
        type="submit"
        className="w-full h-9"
        disabled={isLoading || !watchedType}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {isEditing ? 'Atualizar' : 'Salvar'}
        <Badge variant="outline" className="ml-2 text-xs font-mono">
          Enter
        </Badge>
      </Button>
    </form>
  )
}

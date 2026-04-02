'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playerSchema, type PlayerFormValues } from '@/lib/schemas/player.schema'
import { createPlayer, updatePlayer, deletePlayer } from '@/app/(app)/players/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { PLAYER_POSITION_LABELS, type Player, type PlayerPosition } from '@/lib/types'

interface PlayerFormProps {
  player?: Player
  teams: Array<{ id: string; name: string }>
}

export function PlayerForm({ player, teams }: PlayerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!player

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      team_id:       player?.team_id       ?? (teams[0]?.id ?? ''),
      name:          player?.name          ?? '',
      jersey_number: player?.jersey_number ?? 0,
      position:      player?.position      ?? null,
      is_active:     player?.is_active     ?? true,
      notes:         player?.notes         ?? '',
    },
  })

  const isActive = watch('is_active')

  async function onSubmit(values: PlayerFormValues) {
    setServerError(null)
    const fd = new FormData()
    fd.append('team_id',       values.team_id)
    fd.append('name',          values.name)
    fd.append('jersey_number', String(values.jersey_number))
    if (values.position) fd.append('position', values.position)
    fd.append('is_active',     String(values.is_active))
    if (values.notes) fd.append('notes', values.notes)

    const result = isEditing
      ? await updatePlayer(player.id, fd)
      : await createPlayer(fd)

    if (result.error) {
      setServerError(result.error)
      return
    }

    toast({ title: isEditing ? 'Jogador atualizado' : 'Jogador criado' })
    router.push('/players')
  }

  async function handleDelete() {
    await deletePlayer(player!.id)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="team_id">Time *</Label>
        <Select
          defaultValue={player?.team_id ?? teams[0]?.id}
          onValueChange={(v) => setValue('team_id', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um time" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.team_id && <p className="text-sm text-destructive">{errors.team_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" {...register('name')} placeholder="Nome do jogador" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jersey_number">Número da camisa *</Label>
          <Input
            id="jersey_number"
            type="number"
            min={0}
            max={99}
            {...register('jersey_number', { valueAsNumber: true })}
          />
          {errors.jersey_number && (
            <p className="text-sm text-destructive">{errors.jersey_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Posição</Label>
          <Select
            defaultValue={player?.position ?? ''}
            onValueChange={(v) =>
              setValue('position', v ? (v as PlayerPosition) : null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não informado</SelectItem>
              {Object.entries(PLAYER_POSITION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(v) => setValue('is_active', v)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Jogador ativo
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register('notes')} rows={3} placeholder="Informações adicionais..." />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Salvar alterações' : 'Criar jogador'}
        </Button>

        {isEditing && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir jogador?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os eventos vinculados a este jogador perderão a referência.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { teamSchema, type TeamFormValues } from '@/lib/schemas/team.schema'
import { createTeam, updateTeam, deleteTeam } from '@/app/(app)/teams/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Team } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TeamFormProps {
  team?: Team
}

export function TeamForm({ team }: TeamFormProps) {
  const router  = useRouter()
  const { toast } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!team

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name:            team?.name            ?? '',
      abbreviation:    team?.abbreviation    ?? '',
      primary_color:   team?.primary_color   ?? '#1d4ed8',
      secondary_color: team?.secondary_color ?? '#ffffff',
      notes:           team?.notes           ?? '',
    },
  })

  async function onSubmit(values: TeamFormValues) {
    setServerError(null)
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v != null) fd.append(k, String(v))
    })

    const result = isEditing
      ? await updateTeam(team.id, fd)
      : await createTeam(fd)

    if (result.error) {
      setServerError(result.error)
      return
    }

    toast({ title: isEditing ? 'Time atualizado' : 'Time criado' })
    router.push('/teams')
  }

  async function handleDelete() {
    const result = await deleteTeam(team!.id)
    if (result?.error) {
      toast({ title: 'Erro ao excluir', description: result.error, variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome do time *</Label>
        <Input id="name" {...register('name')} placeholder="Associação Futsal..." />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="abbreviation">Abreviação * (máx. 5 caracteres)</Label>
        <Input
          id="abbreviation"
          {...register('abbreviation')}
          placeholder="AFC"
          className="uppercase"
          maxLength={5}
        />
        {errors.abbreviation && (
          <p className="text-sm text-destructive">{errors.abbreviation.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary_color">Cor primária</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="primary_color"
              {...register('primary_color')}
              className="h-10 w-10 cursor-pointer rounded border border-border bg-transparent"
            />
            <Input {...register('primary_color')} placeholder="#1d4ed8" className="font-mono" />
          </div>
          {errors.primary_color && (
            <p className="text-sm text-destructive">{errors.primary_color.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary_color">Cor secundária</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="secondary_color"
              {...register('secondary_color')}
              className="h-10 w-10 cursor-pointer rounded border border-border bg-transparent"
            />
            <Input {...register('secondary_color')} placeholder="#ffffff" className="font-mono" />
          </div>
          {errors.secondary_color && (
            <p className="text-sm text-destructive">{errors.secondary_color.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Informações adicionais..." rows={3} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Salvar alterações' : 'Criar time'}
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
                <AlertDialogTitle>Excluir time?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é irreversível. Todos os jogadores vinculados também serão removidos.
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

'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { matchSchema, type MatchFormValues } from '@/lib/schemas/match.schema'
import { createMatch } from '@/app/(app)/matches/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface MatchFormProps {
  teams: Array<{ id: string; name: string; abbreviation: string }>
}

export function MatchForm({ teams }: MatchFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      match_date:   new Date().toISOString().split('T')[0],
      team_home_id: '',
      team_away_id: '',
      location:     '',
      notes:        '',
    },
  })

  async function onSubmit(values: MatchFormValues) {
    setServerError(null)
    const fd = new FormData()
    fd.append('team_home_id', values.team_home_id)
    fd.append('team_away_id', values.team_away_id)
    fd.append('match_date',   values.match_date)
    if (values.location) fd.append('location', values.location)
    if (values.notes)    fd.append('notes', values.notes)

    const result = await createMatch(fd)
    if (result.error) {
      setServerError(result.error)
      return
    }

    toast({ title: 'Partida criada' })
    router.push(`/matches/${result.data.id}`)
  }

  if (teams.length < 2) {
    return (
      <Alert>
        <AlertDescription>
          Você precisa de pelo menos 2 times cadastrados para criar uma partida.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Time mandante *</Label>
          <Select onValueChange={(v) => setValue('team_home_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.team_home_id && (
            <p className="text-sm text-destructive">{errors.team_home_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Time visitante *</Label>
          <Select onValueChange={(v) => setValue('team_away_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.team_away_id && (
            <p className="text-sm text-destructive">{errors.team_away_id.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="match_date">Data *</Label>
        <Input id="match_date" type="date" {...register('match_date')} />
        {errors.match_date && (
          <p className="text-sm text-destructive">{errors.match_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local</Label>
        <Input id="location" {...register('location')} placeholder="Ginásio Municipal..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Criar partida
      </Button>
    </form>
  )
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { matchSchema } from '@/lib/schemas/match.schema'
import type { ActionResult, Match } from '@/lib/types'

export async function createMatch(
  formData: FormData
): Promise<ActionResult<Match>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const raw = {
    team_home_id: formData.get('team_home_id'),
    team_away_id: formData.get('team_away_id'),
    match_date:   formData.get('match_date'),
    location:     formData.get('location') || null,
    notes:        formData.get('notes') || null,
  }

  const parsed = matchSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(', ')
    return { data: null, error: msg }
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({ ...parsed.data, owner_id: user.id, status: 'draft' })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/matches')
  revalidatePath('/dashboard')
  return { data, error: null }
}

export async function updateMatch(
  id: string,
  formData: FormData
): Promise<ActionResult<Match>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const raw = {
    team_home_id: formData.get('team_home_id'),
    team_away_id: formData.get('team_away_id'),
    match_date:   formData.get('match_date'),
    location:     formData.get('location') || null,
    notes:        formData.get('notes') || null,
  }

  const parsed = matchSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(', ')
    return { data: null, error: msg }
  }

  const { data, error } = await supabase
    .from('matches')
    .update(parsed.data)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/matches')
  revalidatePath(`/matches/${id}`)
  return { data, error: null }
}

export async function updateMatchStatus(
  id: string,
  status: Match['status']
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath(`/matches/${id}`)
  revalidatePath('/matches')
  return { data: null, error: null }
}

export async function deleteMatch(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/matches')
  revalidatePath('/dashboard')
  redirect('/matches')
}

/** Registra metadados do vídeo após upload direto para o Storage */
export async function saveVideoMetadata(payload: {
  matchId: string
  storagePath: string
  filename: string
  fileSizeBytes: number
  durationSeconds?: number
  fps?: number
}): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  // Remove vídeo anterior se existir
  await supabase
    .from('match_videos')
    .delete()
    .eq('match_id', payload.matchId)
    .eq('owner_id', user.id)

  const { error: insertError } = await supabase.from('match_videos').insert({
    match_id:         payload.matchId,
    owner_id:         user.id,
    storage_path:     payload.storagePath,
    filename:         payload.filename,
    file_size_bytes:  payload.fileSizeBytes,
    duration_seconds: payload.durationSeconds ?? null,
    fps:              payload.fps ?? 30,
  })

  if (insertError) return { data: null, error: insertError.message }

  // Atualiza status da partida
  await supabase
    .from('matches')
    .update({ status: 'uploaded' })
    .eq('id', payload.matchId)
    .eq('owner_id', user.id)

  revalidatePath(`/matches/${payload.matchId}`)
  return { data: null, error: null }
}

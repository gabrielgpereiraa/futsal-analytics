'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { playerSchema } from '@/lib/schemas/player.schema'
import type { ActionResult, Player } from '@/lib/types'

export async function createPlayer(
  formData: FormData
): Promise<ActionResult<Player>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const raw = {
    team_id:       formData.get('team_id'),
    name:          formData.get('name'),
    jersey_number: Number(formData.get('jersey_number')),
    position:      formData.get('position') || null,
    is_active:     formData.get('is_active') !== 'false',
    notes:         formData.get('notes') || null,
  }

  const parsed = playerSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(', ')
    return { data: null, error: msg }
  }

  const { data, error } = await supabase
    .from('players')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/players')
  revalidatePath('/dashboard')
  return { data, error: null }
}

export async function updatePlayer(
  id: string,
  formData: FormData
): Promise<ActionResult<Player>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const raw = {
    team_id:       formData.get('team_id'),
    name:          formData.get('name'),
    jersey_number: Number(formData.get('jersey_number')),
    position:      formData.get('position') || null,
    is_active:     formData.get('is_active') !== 'false',
    notes:         formData.get('notes') || null,
  }

  const parsed = playerSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(', ')
    return { data: null, error: msg }
  }

  const { data, error } = await supabase
    .from('players')
    .update(parsed.data)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/players')
  revalidatePath(`/players/${id}/edit`)
  return { data, error: null }
}

export async function deletePlayer(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/players')
  redirect('/players')
}

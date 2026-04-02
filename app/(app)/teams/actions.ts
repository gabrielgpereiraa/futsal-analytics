'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { teamSchema } from '@/lib/schemas/team.schema'
import type { ActionResult } from '@/lib/types'
import type { Team } from '@/lib/types'

export async function createTeam(
  formData: FormData
): Promise<ActionResult<Team>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const raw = {
    name:            formData.get('name'),
    abbreviation:    formData.get('abbreviation'),
    primary_color:   formData.get('primary_color'),
    secondary_color: formData.get('secondary_color'),
    notes:           formData.get('notes') || null,
  }

  const parsed = teamSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(', ')
    return { data: null, error: msg }
  }

  const { data, error } = await supabase
    .from('teams')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/teams')
  revalidatePath('/dashboard')
  return { data, error: null }
}

export async function updateTeam(
  id: string,
  formData: FormData
): Promise<ActionResult<Team>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const raw = {
    name:            formData.get('name'),
    abbreviation:    formData.get('abbreviation'),
    primary_color:   formData.get('primary_color'),
    secondary_color: formData.get('secondary_color'),
    notes:           formData.get('notes') || null,
  }

  const parsed = teamSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(', ')
    return { data: null, error: msg }
  }

  const { data, error } = await supabase
    .from('teams')
    .update(parsed.data)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/teams')
  revalidatePath(`/teams/${id}/edit`)
  return { data, error: null }
}

export async function deleteTeam(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/teams')
  revalidatePath('/dashboard')
  redirect('/teams')
}

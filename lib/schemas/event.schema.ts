import { z } from 'zod'

const eventTypes = [
  'gol',
  'assistencia',
  'finalizacao',
  'defesa',
  'dividida',
  'falta',
  'recuperacao',
  'perda_de_bola',
  'substituicao',
  'observacao_tatica',
] as const

export const matchEventSchema = z.object({
  timestamp_seconds: z
    .number({ invalid_type_error: 'Timestamp inválido' })
    .min(0, 'Timestamp não pode ser negativo'),
  type: z.enum(eventTypes, { required_error: 'Tipo de evento obrigatório' }),
  team_id: z.string().uuid().optional().nullable(),
  primary_player_id: z.string().uuid().optional().nullable(),
  secondary_player_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).default([]),
})

export type MatchEventFormValues = z.infer<typeof matchEventSchema>

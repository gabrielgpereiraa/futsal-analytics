import { z } from 'zod'

const playerPositions = ['goleiro', 'fixo', 'ala', 'pivo'] as const

export const playerSchema = z.object({
  team_id: z.string().uuid('Time inválido'),
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(80, 'Nome muito longo'),
  jersey_number: z
    .number({ invalid_type_error: 'Número inválido' })
    .int('Deve ser um número inteiro')
    .min(0, 'Mínimo 0')
    .max(99, 'Máximo 99'),
  position: z.enum(playerPositions).optional().nullable(),
  is_active: z.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
})

export type PlayerFormValues = z.infer<typeof playerSchema>

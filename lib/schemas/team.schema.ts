import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(80, 'Nome muito longo'),
  abbreviation: z
    .string()
    .min(1, 'Abreviação obrigatória')
    .max(5, 'Máximo 5 caracteres')
    .toUpperCase(),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida — use formato #RRGGBB'),
  secondary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida — use formato #RRGGBB'),
  notes: z.string().max(500, 'Observações muito longas').optional().nullable(),
})

export type TeamFormValues = z.infer<typeof teamSchema>

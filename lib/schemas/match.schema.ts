import { z } from 'zod'

export const matchSchema = z
  .object({
    team_home_id: z.string().uuid('Time da casa inválido'),
    team_away_id: z.string().uuid('Time visitante inválido'),
    match_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida — use YYYY-MM-DD'),
    location: z.string().max(120, 'Local muito longo').optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  })
  .refine((data) => data.team_home_id !== data.team_away_id, {
    message: 'Time da casa e visitante devem ser diferentes',
    path: ['team_away_id'],
  })

export type MatchFormValues = z.infer<typeof matchSchema>

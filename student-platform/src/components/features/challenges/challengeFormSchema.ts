import { z } from 'zod'

export const challengeSchema = z.object({
  title:            z.string().min(5,  'Title must be at least 5 characters.'),
  description:      z.string().min(20, 'Description must be at least 20 characters.'),
  requirements:     z.string().min(20, 'Requirements must be at least 20 characters.'),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  deadline:         z.string().min(1, 'Deadline is required.').refine(
    v => new Date(v) > new Date(),
    'Deadline must be in the future.',
  ),
})

export type ChallengeFormValues = z.infer<typeof challengeSchema>

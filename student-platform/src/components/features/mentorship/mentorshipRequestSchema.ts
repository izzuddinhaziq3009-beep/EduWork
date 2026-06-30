import { z } from 'zod'

export const mentorshipRequestSchema = z.object({
  message: z.string().min(20, 'Please write at least 20 characters.').max(500, 'Keep it under 500 characters.'),
})

export type MentorshipRequestFormValues = z.infer<typeof mentorshipRequestSchema>

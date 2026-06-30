import { z } from 'zod'

export const projectSubmissionSchema = z.object({
  content: z.string().min(20, 'Please provide at least 20 characters describing your work.'),
})

export type ProjectSubmissionFormValues = z.infer<typeof projectSubmissionSchema>

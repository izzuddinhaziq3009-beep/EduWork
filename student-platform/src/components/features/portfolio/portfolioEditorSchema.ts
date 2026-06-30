import { z } from 'zod'

export const portfolioEditorSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  bio:   z.string().min(20, 'Bio must be at least 20 characters.').max(600, 'Keep bio under 600 characters.'),
  skills: z.string(),
})

export type PortfolioEditorFormValues = z.infer<typeof portfolioEditorSchema>

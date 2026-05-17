import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { IndustryChallenge } from '@/types'

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

interface Props {
  defaultValues?: Partial<ChallengeFormValues>
  onSubmit: (values: ChallengeFormValues) => void
  loading?: boolean
  submitLabel?: string
}

export function ChallengeForm({ defaultValues, onSubmit, loading, submitLabel = 'Submit' }: Props) {
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: '', description: '', requirements: '', difficulty_level: 'beginner', deadline: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) form.reset({ ...form.getValues(), ...defaultValues })
  }, [JSON.stringify(defaultValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Challenge title</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. Reduce checkout friction by 15%" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} placeholder="Overview of the challenge, context, and what you're hoping to learn from submissions…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="requirements" render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} placeholder="Specific deliverables, constraints, and evaluation criteria…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="difficulty_level" render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="deadline" render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input {...field} type="datetime-local"
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" disabled={loading} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
          {loading ? 'Submitting…' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  message: z.string().min(20, 'Please write at least 20 characters.').max(500, 'Keep it under 500 characters.'),
})

interface Props {
  mentorName: string
  onSubmit: (message: string) => void
  loading?: boolean
}

export function MentorshipRequestForm({ mentorName, onSubmit, loading }: Props) {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(v => onSubmit(v.message))} className="space-y-4">
        <div className="text-[14px] ink-2">
          Introduce yourself to <strong>{mentorName}</strong> — tell them about your background and what you hope to learn.
        </div>
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel>Your message</FormLabel>
            <FormControl>
              <Textarea {...field} rows={5} placeholder="Hi! I'm currently learning product design and would love guidance on…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={loading} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
          {loading ? 'Sending…' : 'Send request'}
        </Button>
      </form>
    </Form>
  )
}

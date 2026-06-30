import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { projectSubmissionSchema } from './projectSubmissionSchema'

interface Props {
  onSubmit: (content: string, file?: File) => void
  loading?: boolean
}

export function ProjectSubmissionForm({ onSubmit, loading }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const form = useForm<z.infer<typeof projectSubmissionSchema>>({ resolver: zodResolver(projectSubmissionSchema) })

  const handleSubmit = (vals: z.infer<typeof projectSubmissionSchema>) => {
    onSubmit(vals.content, fileRef.current?.files?.[0])
  }

  return (
    <Form {...form}>
      {/* Wrapped so form.handleSubmit(...) is only constructed at submit time, not during render. */}
      <form onSubmit={e => { void form.handleSubmit(handleSubmit)(e) }} className="space-y-5">
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Your submission</FormLabel>
            <FormControl>
              <Textarea {...field} rows={6} placeholder="Describe your approach, what you built, what you learned, and any challenges you faced…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div>
          <label className="block text-[12.5px] font-medium ink-2 mb-1.5">
            Attach a file <span className="muted font-normal">(optional — PDF, ZIP, or image)</span>
          </label>
          <input ref={fileRef} type="file" accept=".pdf,.zip,.png,.jpg,.jpeg,.gif"
            className="block w-full text-[13px] text-[color:var(--ink-2)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[var(--primary-soft)] file:text-[color:var(--primary)] hover:file:bg-[var(--hair-2)] cursor-pointer" />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11" style={{ background: 'var(--primary)' }}>
          {loading ? 'Submitting…' : 'Submit project'}
        </Button>
      </form>
    </Form>
  )
}

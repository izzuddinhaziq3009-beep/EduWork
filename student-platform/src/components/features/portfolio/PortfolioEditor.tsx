import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { DigitalPortfolio } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  bio:   z.string().min(20, 'Bio must be at least 20 characters.').max(600, 'Keep bio under 600 characters.'),
  skills: z.string(),
})

interface Props {
  portfolio?: DigitalPortfolio
  onSave: (data: { title: string; bio: string; skills: string[] }) => void
  saving?: boolean
}

export function PortfolioEditor({ portfolio, onSave, saving }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:  portfolio?.title  ?? '',
      bio:    portfolio?.bio    ?? '',
      skills: (portfolio?.skills ?? []).join(', '),
    },
  })

  useEffect(() => {
    if (portfolio) {
      form.reset({
        title:  portfolio.title,
        bio:    portfolio.bio,
        skills: portfolio.skills.join(', '),
      })
    }
  }, [portfolio, form])

  const handleSubmit = (vals: z.infer<typeof schema>) => {
    const skills = vals.skills.split(',').map(s => s.trim()).filter(Boolean)
    onSave({ title: vals.title, bio: vals.bio, skills })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Portfolio title</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. Maya Rodriguez — Product Designer" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="bio" render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl><Textarea {...field} rows={5} placeholder="Tell recruiters and mentors who you are…" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="skills" render={({ field }) => (
          <FormItem>
            <FormLabel>Skills <span className="muted font-normal text-[12px]">(comma-separated)</span></FormLabel>
            <FormControl><Input {...field} placeholder="e.g. Figma, Python, Product Strategy, SQL" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={saving} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
          {saving ? 'Saving…' : portfolio ? 'Update portfolio' : 'Create portfolio'}
        </Button>
      </form>
    </Form>
  )
}

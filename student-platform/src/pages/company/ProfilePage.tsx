import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyProfile, useUpdateCompanyProfile } from '@/hooks/useCompany'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  full_name:            z.string().min(2, 'Company name is required.'),
  company_description:  z.string().max(600).optional(),
  company_website:      z.string().url('Enter a valid URL.').optional().or(z.literal('')),
  company_industry:     z.string().max(100).optional(),
})

export function ProfilePage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useCompanyProfile(user?.id ?? '')
  const update = useUpdateCompanyProfile()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', company_description: '', company_website: '', company_industry: '' },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name:           profile.full_name,
        company_description: profile.company_description ?? '',
        company_website:     profile.company_website     ?? '',
        company_industry:    profile.company_industry    ?? '',
      })
    }
  }, [profile, form])

  const onSubmit = (vals: z.infer<typeof schema>) => {
    if (!user) return
    update.mutate({
      companyId: user.id,
      data: {
        full_name:            vals.full_name,
        company_description:  vals.company_description || undefined,
        company_website:      vals.company_website     || undefined,
        company_industry:     vals.company_industry    || undefined,
      },
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-[700px]">
      <PageHeader label="Account" title="Company Profile" description="Update your company details visible to students." />

      {isLoading ? (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl><Input {...field} placeholder="Acme Corp" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="company_industry" render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry <span className="muted font-normal text-[12px]">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Fintech, Healthcare, SaaS" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="company_website" render={({ field }) => (
                <FormItem>
                  <FormLabel>Website <span className="muted font-normal text-[12px]">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://yourcompany.com" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="company_description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="muted font-normal text-[12px]">(optional)</span></FormLabel>
                  <FormControl><Textarea {...field} rows={4} placeholder="Tell students about your company and what kind of talent you're looking for…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={update.isPending} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
                {update.isPending ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}

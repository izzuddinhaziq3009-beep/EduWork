import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useEnrollModule } from '@/hooks/useModules'
import { getActiveModulesForLanding, getLandingStats } from '@/services/moduleService'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { LandingModuleCard } from '@/components/landing/LandingModuleCard'
import { CategoryCard } from '@/components/landing/CategoryCard'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import type { ModuleWithLearnerCount } from '@/services/moduleService'

interface Category {
  name: string
  icon: string
  keywords: string[]
}

const CATEGORIES: Category[] = [
  { name: 'Programming',     icon: '💻', keywords: ['programming', 'code', 'javascript', 'python', 'web', 'software', 'developer', 'app'] },
  { name: 'Data Science',    icon: '📊', keywords: ['data', 'analytics', 'statistics', 'sql'] },
  { name: 'Cloud Computing', icon: '☁️', keywords: ['cloud', 'aws', 'azure', 'devops', 'infrastructure'] },
  { name: 'AI & ML',         icon: '🤖', keywords: ['ai', 'machine learning', 'artificial intelligence', 'neural', 'model'] },
  { name: 'Business',        icon: '💼', keywords: ['business', 'management', 'marketing', 'finance', 'product'] },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const enroll = useEnrollModule()

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['landing-modules'], queryFn: () => getActiveModulesForLanding(), staleTime: 60_000,
  })
  const { data: stats } = useQuery({
    queryKey: ['landing-stats'], queryFn: getLandingStats, staleTime: 60_000,
  })

  const filtered = useMemo(() => {
    let list = modules
    if (category) {
      const cat = CATEGORIES.find(c => c.name === category)
      if (cat) list = list.filter(m => cat.keywords.some(k => `${m.title} ${m.description}`.toLowerCase().includes(k)))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    }
    return list
  }, [modules, category, search])

  const isFiltered = !!category || search.trim().length > 0
  const displayed = isFiltered ? filtered : filtered.slice(0, 6)
  const heading = category ? `${category} courses` : search ? `Results for "${search}"` : 'Recommended for You'

  const handleEnroll = (module: ModuleWithLearnerCount) => {
    if (!user) {
      navigate(`/signup?redirect=/modules/${module.id}`)
      return
    }
    enroll.mutate({ moduleId: module.id, studentId: user.id }, {
      onSuccess: () => navigate(`/modules/${module.id}`),
    })
  }

  const ctaHref = user ? '/dashboard' : '/signup'

  return (
    <div className="min-h-screen bg-slate-950">
      <LandingNavbar />
      <HeroSection ctaHref={ctaHref} stats={stats} />

      {/* Modules */}
      <section id="modules" className="py-20 px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{heading}</h2>
              <p className="text-slate-400 mt-1.5">Hand-picked modules to help you build job-ready skills.</p>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search modules…"
              aria-label="Search modules"
              className="w-full sm:w-72 h-11 rounded-xl bg-gray-800 border border-white/10 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors duration-300"
            />
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {CATEGORIES.map(c => (
              <CategoryCard key={c.name} name={c.name} icon={<span className="text-xl">{c.icon}</span>}
                active={category === c.name} onClick={() => setCategory(category === c.name ? null : c.name)} />
            ))}
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-gray-800/60 animate-pulse" />)}
            </div>
          ) : displayed.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No modules match yet — check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayed.map(m => (
                <LandingModuleCard key={m.id} module={m} onEnroll={handleEnroll} enrolling={enroll.isPending} />
              ))}
            </div>
          )}
        </div>
      </section>

      <BenefitsSection />
      <LandingFooter />
    </div>
  )
}

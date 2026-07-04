import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { ModulesTabContent } from '@/pages/ModulesPage'
import { ClassesTabContent } from '@/pages/StudentClasses'
import { CertificatesTabContent } from '@/pages/StudentCertificates'

const TABS = [
  { value: 'modules',      label: 'Modules'      },
  { value: 'classes',      label: 'My Classes'   },
  { value: 'certificates', label: 'Certificates' },
] as const

type LearningTab = typeof TABS[number]['value']

const VALID: Set<string> = new Set(TABS.map(t => t.value))

export function LearningPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('tab') ?? ''
  const tab: LearningTab = (VALID.has(raw) ? raw : 'modules') as LearningTab

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <PageHeader
        label="Your learning"
        title="Learning"
        description="Browse modules, join a mentor's class, and view your earned certificates."
      />

      {/* Primary segmented control */}
      <div
        className="inline-flex p-1 rounded-xl gap-1 mb-8"
        style={{ background: 'var(--hair-2)', border: '1px solid var(--hair)' }}
      >
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setSearchParams(
              t.value === 'modules' ? {} : { tab: t.value },
              { replace: true },
            )}
            className="px-5 py-2 rounded-[10px] text-[13.5px] font-semibold transition-all"
            style={tab === t.value ? {
              background: 'var(--primary)',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            } : { color: 'var(--ink-2)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'modules'      && <ModulesTabContent />}
      {tab === 'classes'      && <ClassesTabContent />}
      {tab === 'certificates' && <CertificatesTabContent />}
    </div>
  )
}

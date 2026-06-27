import type { GitHubValidationResult, GitHubStepStatus } from '@/services/challengeService'

interface StepProps {
  label:   string
  status:  GitHubStepStatus
  message: string
  loading: boolean
}

function Step({ label, status, message, loading }: StepProps) {
  const showMessage = status === 'error' || (status === 'success' && message)

  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
        {loading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--hair)" strokeWidth="2.5"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : status === 'success' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7"/>
          </svg>
        ) : status === 'error' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full" style={{ border: '1.5px solid var(--hair)' }} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1">
        <div className={`text-[13.5px] font-medium ${
          status === 'success' ? 'text-[color:var(--accent)]' :
          status === 'error'   ? 'text-[color:var(--rose)]'   :
          'text-[color:var(--ink-2)]'
        }`}>
          {label}
        </div>
        {showMessage && (
          <div className="text-[12px] mt-0.5" style={{ color: status === 'error' ? 'var(--rose)' : 'var(--muted)' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  result?:  GitHubValidationResult
  loading:  boolean
  hasUrl:   boolean
}

export function GitHubValidation({ result, loading, hasUrl }: Props) {
  const s = result?.steps

  const STEPS: Array<{ key: keyof NonNullable<typeof s>; label: string }> = [
    { key: 'urlFormat',  label: 'Valid GitHub URL format' },
    { key: 'repoPublic', label: 'Repository found and is public' },
    { key: 'readme',     label: 'README.md exists' },
    { key: 'privacy',    label: '.github/SUBMISSION_PRIVACY.md exists' },
    { key: 'commits',    label: 'Minimum 3 commits' },
  ]

  if (!hasUrl) return null

  return (
    <div className="hairline rounded-xl p-4 space-y-3" style={{ background: 'var(--hair-2)' }}>
      <div className="text-[12px] font-mono tracking-wide muted uppercase">Repository requirements</div>
      {STEPS.map((step, i) => {
        const stepData = s?.[step.key]
        // A step is "loading" if the previous step passed and this one is still pending
        const prevPassed = i === 0 || (s && STEPS.slice(0, i).every(ps => s[ps.key]?.status === 'success'))
        const isLoading  = loading && !!prevPassed && (!stepData || stepData.status === 'pending')

        return (
          <Step
            key={step.key}
            label={step.label}
            status={stepData?.status ?? 'pending'}
            message={stepData?.message ?? ''}
            loading={isLoading}
          />
        )
      })}
    </div>
  )
}

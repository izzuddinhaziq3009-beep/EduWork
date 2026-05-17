import { useState } from 'react'
import { useValidateGitHub } from '@/hooks/useChallenges'
import { GitHubValidation } from './GitHubValidation'
import { Input } from '@/components/ui/input'
import type { GitHubValidationResult } from '@/services/challengeService'

interface Props {
  onSubmit: (validation: GitHubValidationResult) => void
  loading?: boolean
}

export function ChallengeSubmissionForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState('')

  const { data: validation, isFetching } = useValidateGitHub(url)

  const canSubmit = !loading && !isFetching && !!validation?.isValid

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12.5px] font-medium ink-2 mb-1.5">GitHub repository URL</label>
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="font-mono text-[13px]"
        />
        <p className="text-[11.5px] muted mt-1.5">
          The repository must be public, have a README.md, a .github/SUBMISSION_PRIVACY.md file, and at least 3 commits.
        </p>
      </div>

      <GitHubValidation
        result={validation}
        loading={isFetching}
        hasUrl={url.length > 10}
      />

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => validation && onSubmit(validation)}
        className="w-full h-11 rounded-xl text-[13.5px] font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ background: 'var(--primary)' }}
        title={!canSubmit && !isFetching && url.length > 10 ? 'Fix the validation errors above' : undefined}
      >
        {loading    ? 'Submitting…' :
         isFetching ? 'Validating repository…' :
         canSubmit  ? 'Submit solution' :
         url.length > 10 ? 'Fix validation errors to continue' :
         'Enter GitHub URL to continue'}
      </button>
    </div>
  )
}

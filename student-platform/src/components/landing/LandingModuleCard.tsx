import { fmtDuration } from '@/utils/formatters'
import type { ModuleWithLearnerCount } from '@/services/moduleService'
import type { DifficultyLevel } from '@/types'

const DIFFICULTY_STYLE: Record<DifficultyLevel, string> = {
  beginner:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  advanced:     'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

interface Props {
  module: ModuleWithLearnerCount
  onEnroll: (module: ModuleWithLearnerCount) => void
  enrolling?: boolean
}

export function LandingModuleCard({ module, onEnroll, enrolling }: Props) {
  return (
    <div className="group bg-gray-800 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/40 hover:-translate-y-1">
      <div className="w-11 h-11 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-lg shrink-0" aria-hidden>
        {module.module_type === 'structured' ? '📚' : '📄'}
      </div>
      <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-1">{module.title}</h3>
      <p className="text-slate-400 text-[13px] leading-relaxed line-clamp-2 flex-1">{module.description}</p>
      <div className="flex items-center gap-2 flex-wrap text-[11.5px]">
        <span className={`px-2 py-0.5 rounded-full border font-medium capitalize ${DIFFICULTY_STYLE[module.difficulty_level]}`}>
          {module.difficulty_level}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <span aria-hidden>🕒</span> {fmtDuration(module.duration_hours)}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <span className="text-[12px] text-slate-500">
          <span aria-hidden>👥</span> {module.learnerCount.toLocaleString()} learner{module.learnerCount === 1 ? '' : 's'}
        </span>
        <button onClick={() => onEnroll(module)} disabled={enrolling}
          className="text-[12.5px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-300 px-3.5 py-1.5 rounded-lg disabled:opacity-60">
          {enrolling ? '…' : 'Enroll'}
        </button>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import type { LandingStats } from '@/services/moduleService'

interface Props {
  ctaHref: string
  stats?: LandingStats
}

function fmtStat(n: number | undefined): string {
  if (!n) return '0'
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`
  return `${n}+`
}

export function HeroSection({ ctaHref, stats }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pt-20 pb-16 px-6 lg:px-8">
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 80% 10%, rgba(6,182,212,0.25), transparent 55%)' }} />

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full mb-6">
          Student Experience Platform
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          Learn Skills for the Future
        </h1>
        <p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto">
          Master in-demand skills with industry experts — structured modules, real mentorship, and hands-on industry challenges.
        </p>
        <div className="mt-9 flex items-center justify-center gap-4 flex-wrap">
          <Link to={ctaHref}
            className="px-7 py-3.5 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-500 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-600/40">
            Start Learning
          </Link>
          <a href="#modules"
            className="px-7 py-3.5 rounded-xl text-white font-semibold border border-white/20 hover:bg-white/5 transition-colors duration-300">
            Browse Modules
          </a>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4 sm:gap-8 text-center">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{fmtStat(stats?.totalStudents)}</div>
          <div className="text-[12.5px] text-slate-400 mt-1">Learners</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{fmtStat(stats?.totalModules)}</div>
          <div className="text-[12.5px] text-slate-400 mt-1">Modules</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{fmtStat(stats?.totalEnrollments)}</div>
          <div className="text-[12.5px] text-slate-400 mt-1">Enrollments</div>
        </div>
      </div>
    </section>
  )
}

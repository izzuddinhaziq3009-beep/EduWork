import { EduWorkLogo } from './EduWorkLogo'

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-white font-bold">
          <EduWorkLogo size={28} />
          EduWork
        </div>
        <nav className="flex items-center gap-6 text-[13px] text-slate-400" aria-label="Footer">
          <a href="#" className="hover:text-white transition-colors duration-300">About</a>
          <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
          <a href="#" className="hover:text-white transition-colors duration-300">Privacy</a>
          <a href="#" className="hover:text-white transition-colors duration-300">Terms</a>
        </nav>
        <div className="flex items-center gap-4">
          {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
            <a key={s} href="#" aria-label={s} className="text-slate-400 hover:text-white transition-colors duration-300 text-[13px]">{s}</a>
          ))}
        </div>
      </div>
      <p className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-[12px] text-slate-500 text-center">
        © {new Date().getFullYear()} EduWork. All rights reserved.
      </p>
    </footer>
  )
}

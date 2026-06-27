import type { ReactNode } from 'react'

interface Props {
  name: string
  icon: ReactNode
  active: boolean
  onClick: () => void
}

export function CategoryCard({ name, icon, active, onClick }: Props) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
        active ? 'bg-indigo-600/20 border-indigo-500' : 'bg-gray-800 border-white/10 hover:border-indigo-500/50 hover:-translate-y-1'
      }`}>
      <div className={`w-12 h-12 rounded-xl grid place-items-center ${active ? 'bg-indigo-500 text-white' : 'bg-indigo-500/15 text-indigo-400'}`} aria-hidden>
        {icon}
      </div>
      <span className="text-white text-[13.5px] font-semibold text-center">{name}</span>
    </button>
  )
}

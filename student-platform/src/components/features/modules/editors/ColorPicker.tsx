import { MODULE_COLOR_OPTIONS, resolveModuleColor } from '@/utils/moduleColors'

interface Props {
  value: string | null
  onChange: (color: string | null) => void
}

export function ColorPicker({ value, onChange }: Props) {
  const customActive = !!value && value.startsWith('#')

  return (
    <div className="space-y-2.5">
      <label className="text-[12.5px] font-medium ink-2 block">Card color</label>
      <div className="flex items-center gap-2 flex-wrap">
        {MODULE_COLOR_OPTIONS.map(c => (
          <button key={c.value} type="button" onClick={() => onChange(c.value)} title={c.label}
            className="w-8 h-8 rounded-full shrink-0 grid place-items-center transition-transform hover:scale-110"
            style={{ background: c.hex, boxShadow: value === c.value ? `0 0 0 2px var(--surface), 0 0 0 4px ${c.hex}` : 'none' }}>
            {value === c.value && (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
            )}
          </button>
        ))}

        {/* Custom hex color */}
        <label title="Custom color"
          className="w-8 h-8 rounded-full shrink-0 grid place-items-center cursor-pointer hairline relative overflow-hidden"
          style={{ background: customActive ? value! : 'var(--hair-2)', boxShadow: customActive ? `0 0 0 2px var(--surface), 0 0 0 4px ${value}` : 'none' }}>
          {!customActive && (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--muted)]">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
            </svg>
          )}
          <input type="color" value={resolveModuleColor(value) ?? '#4F46E5'} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>

        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-[12px] font-semibold ink-2 hover:underline ml-1">
            Clear
          </button>
        )}
      </div>
      <p className="text-[11.5px] muted">Used for the module card header. Falls back to a difficulty-based color if left unset.</p>
    </div>
  )
}

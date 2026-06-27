export interface ModuleColorOption {
  value: string
  label: string
  hex: string
}

// Note: "Cyan" carries the #06B6D4 swatch — the app's existing accent color —
// rather than calling it "Blue" (which would be a mismatched label for that hex).
export const MODULE_COLOR_OPTIONS: ModuleColorOption[] = [
  { value: 'cyan',   label: 'Cyan',   hex: '#06B6D4' },
  { value: 'red',    label: 'Red',    hex: '#EF4444' },
  { value: 'green',  label: 'Green',  hex: '#22C55E' },
  { value: 'purple', label: 'Purple', hex: '#A855F7' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'pink',   label: 'Pink',   hex: '#EC4899' },
  { value: 'yellow', label: 'Yellow', hex: '#FBBF24' },
  { value: 'indigo', label: 'Indigo', hex: '#6366F1' },
]

const PRESET_MAP = Object.fromEntries(MODULE_COLOR_OPTIONS.map(c => [c.value, c.hex]))

/** Resolves a stored `module_color` (preset name or literal hex) to a CSS color, or null if unset. */
export function resolveModuleColor(moduleColor: string | null | undefined): string | null {
  if (!moduleColor) return null
  if (moduleColor.startsWith('#')) return moduleColor
  return PRESET_MAP[moduleColor] ?? null
}

interface Props {
  value: number
  onChange?: (n: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readonly = false, size = 24 }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          title={readonly ? undefined : `${n} star${n > 1 ? 's' : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={n <= value ? 'var(--warn)' : 'none'}
            stroke={n <= value ? 'var(--warn)' : 'var(--hair)'}
            strokeWidth="1.5"
          >
            <path d="M12 3l2.7 6 6.3.5-4.8 4.2 1.5 6.3L12 16.8 6.3 20l1.5-6.3L3 9.5 9.3 9z"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

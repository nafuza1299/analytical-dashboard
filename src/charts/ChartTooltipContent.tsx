import type { TooltipContentProps } from 'recharts'
import { formatFull } from './chartTheme'

// Custom content because recharts' DefaultTooltipContent only renders a
// series name when it's a string (its `isNumOrStr` check silently drops
// anything else) — there's no way to prefix it with a color swatch via the
// `formatter` prop alone. This mirrors the legend's swatch instead.
const boxStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  maxWidth: 280,
  padding: 10,
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  color: 'var(--color-text)',
} as const

interface Props extends TooltipContentProps {
  isCurrency?: boolean
  suffix?: string
}

export function ChartTooltipContent({ active, payload, label, isCurrency, suffix }: Props) {
  if (!active || !payload?.length) return null
  return (
    <div style={boxStyle}>
      {label != null && <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{label}</p>}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {payload.map((entry, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
            <span
              style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: entry.color, flexShrink: 0 }}
            />
            <span>
              {entry.name} : {isCurrency && '$'}
              {formatFull(Number(entry.value))}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

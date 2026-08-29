// Shared across all chart types so every axis/tooltip/legend formats numbers
// and colors the same way. Locale is Indonesian per the plan's own callout
// (1.234,56 grouping/decimal, not the 1,234.56 default) — swap here if the
// app ever needs to be locale-aware per user instead of fixed.
export const LOCALE = 'id-ID'

export const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2']

const compactFormatter = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
const fullFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 })

export function formatCompact(value: number): string {
  return compactFormatter.format(value)
}

export function formatFull(value: number): string {
  return fullFormatter.format(value)
}

// Skips overlapping ticks instead of rotating/truncating labels.
export const xAxisTickProps = { interval: 'preserveStartEnd' as const }

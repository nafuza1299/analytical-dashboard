// Shared across all chart types so every axis/tooltip/legend formats numbers
// and colors the same way. Locale is Indonesian per the plan's own callout
// (1.234,56 grouping/decimal, not the 1,234.56 default) — swap here if the
// app ever needs to be locale-aware per user instead of fixed.
export const LOCALE = 'id-ID'

export const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2']

// English abbreviation letters (K/M/B/T) — id-ID's compact notation uses
// "M" for miliar (billion) and "jt" for juta (million), which reads as the
// wrong magnitude to an English-reading audience.
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const fullFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 })

export function formatCompact(value: number): string {
  return compactFormatter.format(value)
}

export function formatFull(value: number): string {
  return fullFormatter.format(value)
}

// Same font as Card.Title, sized down from the title's own size so axis
// numbers don't compete with it (16px -> 10px -> +15% -> 12px).
export const axisTickStyle = { fontFamily: 'var(--font-sans)', fontSize: 12 }

// Skips overlapping ticks instead of rotating/truncating labels.
export const xAxisTickProps = { interval: 'preserveStartEnd' as const, tick: axisTickStyle }

// Right-side, smaller-font legend shared by every chart that has one.
// maxHeight + overflowY caps it so a long country list scrolls instead of
// overflowing the chart (recharts has no built-in legend pagination).
export const legendProps = {
  layout: 'vertical' as const,
  verticalAlign: 'middle' as const,
  align: 'right' as const,
  wrapperStyle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    maxHeight: 280,
    overflowY: 'auto' as const,
    // Gap between the plotted chart and the legend column: the chart's own
    // right margin (16px) increased 10%.
    paddingLeft: 18,
  },
  // Overrides recharts' default of coloring each item's text like its
  // series swatch — themed black/white instead so the text stays legible
  // regardless of series color or light/dark mode.
  labelStyle: { color: 'var(--color-text)' },
}

// Tooltip box themed off the same CSS variables as the rest of the app, so it
// reads as app chrome instead of recharts' default stark-white popup — which
// was blinding on the dark theme.
export const tooltipProps = {
  contentStyle: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
  },
  labelStyle: { color: 'var(--color-text)' },
  itemStyle: { color: 'var(--color-text)' },
}

// Tooltip's hover-highlight cursor (the rectangle behind a bar / vertical
// line on a line chart) — reuses the app's own hover token instead of
// recharts' default light grey, which washed out on dark backgrounds.
export const cursorFill = { fill: 'var(--color-surface-hover)' }
export const cursorLine = { stroke: 'var(--color-border)' }

// CartesianGrid's default stroke (#ccc) is a light grey — fine on white,
// glaring against the dark theme's near-black surface. The border token
// tracks both themes already.
export const gridStroke = 'var(--color-border)'

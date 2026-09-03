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

// Only GDP is US$-denominated (World Bank's ".CD" suffix) — Inflation/Trade
// and most other indicators are %, years, or other units where a $ prefix
// would be wrong. Same maintained-allowlist approach as isAdditiveIndicator,
// for the same reason: the API doesn't flag units itself.
const CURRENCY_INDICATOR_CODES = new Set([
  'NY.GDP.MKTP.CD', // GDP (current US$)
])

export function isCurrencyIndicator(indicatorCode: string | undefined): boolean {
  return indicatorCode != null && CURRENCY_INDICATOR_CODES.has(indicatorCode)
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

// Box styling/wrapping lives in ChartTooltipContent (the custom `content`
// renderer, needed for the legend-style swatch and the $-prefix, both of
// which need per-chart data DefaultTooltipContent can't take — so `content`
// is wired up per chart instead of living here). What's left here is
// wrapper-level: position and scroll behavior, which apply regardless of
// what renders inside.
export const tooltipProps = {
  wrapperStyle: {
    // Recharts positions the wrapper via a calculated `transform:
    // translate(x,y)` that chases the cursor, flipping above/below/left/
    // right to (try to) stay on-screen — with a tall, many-row tooltip this
    // kept flipping to a spot that ran past the card's top or bottom edge
    // (clipped by the card's own overflow-hidden) no matter which offset or
    // escape-viewbox knob was tuned. Pinning it to the chart's own center
    // sidesteps the whole fits-on-screen calculation: `top`/`left` here
    // override recharts' `0`/`0`, and `transform` overrides its computed
    // translate (recharts merges wrapperStyle in last), centering the box
    // in `.recharts-wrapper` (the chart's own positioned container) instead
    // of chasing the hovered point.
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: 280,
    overflowY: 'auto' as const,
    // Recharts defaults this wrapper to pointer-events: none so chart hover
    // tracking passes through it — but that also blocks wheel/scroll input,
    // making the maxHeight above unscrollable. Re-enable it just here.
    pointerEvents: 'auto' as const,
    // <Tooltip> is declared before <Legend> in every chart, so without this
    // the legend (same DOM stacking context, no z-index of its own) paints
    // and hit-tests above the tooltip wherever the two overlap — swallowing
    // hover/scroll input meant for the tooltip.
    zIndex: 10,
  },
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

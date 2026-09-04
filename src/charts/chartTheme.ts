import { useCallback, useMemo, useState } from 'react'

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

/** Legend click-to-filter, shared by every chart with a Legend. Plain click
 * isolates to just that series (click it again to reset to "all visible").
 * Shift+click toggles a series into/out of the current visible set, for
 * building up a custom multi-selection. Ctrl/Cmd+click explicitly hides one
 * series without touching the rest. */
export function useLegendSelection(allKeys: string[]) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())

  const isHidden = useCallback((key: string) => hidden.has(key), [hidden])

  const onLegendClick = useCallback(
    (key: string, event: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => {
      setHidden((prev) => {
        if (event.ctrlKey || event.metaKey) return new Set(prev).add(key)
        if (event.shiftKey) {
          const next = new Set(prev)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        }
        const isolatedToThisKey = allKeys.length - prev.size === 1 && !prev.has(key)
        return isolatedToThisKey ? new Set() : new Set(allKeys.filter((k) => k !== key))
      })
    },
    [allKeys],
  )

  return { isHidden, onLegendClick }
}

// Legend text for a hidden series — greyed and struck through so the toggle
// state is visible at a glance, on top of the click handling above.
export function legendItemStyle(hidden: boolean) {
  return { opacity: hidden ? 0.5 : 1, textDecoration: hidden ? ('line-through' as const) : 'none', cursor: 'pointer' }
}

const TOOLTIP_MAX_HEIGHT = 280

// Box styling/wrapping lives in ChartTooltipContent (the custom `content`
// renderer, needed for the legend-style swatch and the $-prefix, both of
// which need per-chart data DefaultTooltipContent can't take — so `content`
// is wired up per chart instead of living here). What's left here is
// wrapper-level: scroll behavior, which applies regardless of what renders
// inside. Vertical position is handled separately by useTooltipCenterY
// below, since it needs the chart's own rendered height.
export const tooltipProps = {
  wrapperStyle: {
    maxHeight: TOOLTIP_MAX_HEIGHT,
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

/** Keeps the tooltip horizontally near the cursor (recharts' normal
 * left/right-flip behavior, unchanged — reachable with the mouse so the
 * scrollable box above is actually usable) while pinning it vertically to
 * the chart's own center via recharts' `position.y` (bypasses the
 * fits-above/fits-below flip that was running a tall, many-row tooltip off
 * the top or bottom of the card, clipped by the card's own overflow-hidden).
 * `position.y` is in the same pixel space as the chart's rendered height,
 * which ResponsiveContainer only reports through `onResize` — hence the
 * state. Assumes the common/max-height case for centering rather than
 * measuring the tooltip's own (variable, content-dependent) height, so a
 * short tooltip sits a bit above true center instead of exactly centered —
 * never clipped, just not pixel-perfect. */
export function useTooltipCenterY() {
  const [chartHeight, setChartHeight] = useState(0)
  // Rounds before comparing: ResizeObserver reports sub-pixel-different
  // floats on every pass even when nothing visibly changed, and setting
  // state on every one of those would re-render every frame for no reason.
  const onResize = useCallback((_width: number, height: number) => {
    setChartHeight((prev) => (Math.round(prev) === Math.round(height) ? prev : height))
  }, [])
  // Memoized: recharts' Tooltip watches `position` by reference internally,
  // so handing it a fresh `{ y }` object literal every render (even with an
  // unchanged value) re-triggers that watcher every render — an infinite
  // loop, confirmed via "Maximum update depth exceeded" in the console
  // while testing this. Stable reference unless chartHeight actually moves.
  const position = useMemo(() => ({ y: Math.max(0, chartHeight / 2 - TOOLTIP_MAX_HEIGHT / 2) }), [chartHeight])
  return { onResize, position }
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

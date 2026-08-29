import { DEFAULT_COLS, type Layout, type ResponsiveLayouts } from 'react-grid-layout'

const CACHE_KEY = 'layout.v1'

// A floor so a chart can't be resized down to something unusable (a squashed
// axis, an unreadable table). No maxW/maxH — growing as large as the grid
// allows is fine.
const MIN_W = 3
const MIN_H = 8
const ITEMS = ['line', 'bar', 'pie', 'table']

// react-grid-layout only auto-derives a missing breakpoint's layout by
// copying+clamping the nearest larger one, it doesn't rescale item widths —
// so a layout authored only for `lg` (12 cols) overflows its container once
// the grid drops to md/sm cols and gets clipped on the right, reading as
// pushed left. Sizing each breakpoint from its own `cols` avoids that: two
// side-by-side at MIN_W or wider, one full-width column below that.
function layoutForCols(cols: number): Layout {
  if (cols >= MIN_W * 2) {
    const w = Math.floor(cols / 2)
    return [
      { i: 'line', x: 0, y: 0, w, h: 16, minW: MIN_W, minH: MIN_H },
      { i: 'bar', x: w, y: 0, w, h: 16, minW: MIN_W, minH: MIN_H },
      { i: 'pie', x: 0, y: 16, w, h: 16, minW: MIN_W, minH: MIN_H },
      { i: 'table', x: w, y: 16, w, h: 16, minW: MIN_W, minH: MIN_H },
    ]
  }
  return ITEMS.map((i, idx) => ({ i, x: 0, y: idx * 16, w: cols, h: 16, minW: MIN_W, minH: MIN_H }))
}

export const DEFAULT_LAYOUT: Layout = layoutForCols(DEFAULT_COLS.lg)

export const DEFAULT_LAYOUTS: ResponsiveLayouts<string> = Object.fromEntries(
  Object.entries(DEFAULT_COLS).map(([breakpoint, cols]) => [breakpoint, layoutForCols(cols)]),
)

// Keyed by page (the active indicator code) so rearranging the GDP page's
// charts doesn't touch the Life Expectancy page's arrangement.
type LayoutCache = Record<string, ResponsiveLayouts<string>>

function readAllLayouts(): LayoutCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function readLayoutCache(pageKey: string): ResponsiveLayouts<string> | null {
  return readAllLayouts()[pageKey] ?? null
}

export function writeLayoutCache(pageKey: string, layouts: ResponsiveLayouts<string>) {
  try {
    const all = readAllLayouts()
    all[pageKey] = layouts
    localStorage.setItem(CACHE_KEY, JSON.stringify(all))
  } catch {
    // storage disabled/full — layout just won't persist across sessions
  }
}

export function clearLayoutCache(pageKey: string) {
  try {
    const all = readAllLayouts()
    delete all[pageKey]
    localStorage.setItem(CACHE_KEY, JSON.stringify(all))
  } catch {
    // storage disabled — nothing was persisted to clear anyway
  }
}

import type { Layout, ResponsiveLayouts } from 'react-grid-layout'

const CACHE_KEY = 'layout.v1'

// A floor so a chart can't be resized down to something unusable (a squashed
// axis, an unreadable table). No maxW/maxH — growing as large as the grid
// allows is fine.
const MIN_W = 3
const MIN_H = 8

// Only the widest breakpoint is authored by hand; react-grid-layout derives
// reasonable layouts for md/sm/xs/xxs from this one automatically — manually
// tuning every breakpoint is the real time sink the plan warns about.
export const DEFAULT_LAYOUT: Layout = [
  { i: 'line', x: 0, y: 0, w: 6, h: 16, minW: MIN_W, minH: MIN_H },
  { i: 'bar', x: 6, y: 0, w: 6, h: 16, minW: MIN_W, minH: MIN_H },
  { i: 'pie', x: 0, y: 16, w: 6, h: 16, minW: MIN_W, minH: MIN_H },
  { i: 'table', x: 6, y: 16, w: 6, h: 16, minW: MIN_W, minH: MIN_H },
]

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

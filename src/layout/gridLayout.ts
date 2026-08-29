import type { Layout, ResponsiveLayouts } from 'react-grid-layout'

const CACHE_KEY = 'layout.v1'

// Only the widest breakpoint is authored by hand; react-grid-layout derives
// reasonable layouts for md/sm/xs/xxs from this one automatically — manually
// tuning every breakpoint is the real time sink the plan warns about.
export const DEFAULT_LAYOUT: Layout = [
  { i: 'line', x: 0, y: 0, w: 6, h: 16 },
  { i: 'bar', x: 6, y: 0, w: 6, h: 16 },
  { i: 'pie', x: 0, y: 16, w: 6, h: 16 },
  { i: 'table', x: 6, y: 16, w: 6, h: 16 },
]

export function readLayoutCache(): ResponsiveLayouts<string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeLayoutCache(layouts: ResponsiveLayouts<string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(layouts))
  } catch {
    // storage disabled/full — layout just won't persist across sessions
  }
}

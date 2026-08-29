import { useState, type ReactNode } from 'react'
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  ResponsiveGridLayout,
  type Layout,
  type ResponsiveLayouts,
} from 'react-grid-layout'
import { DEFAULT_LAYOUTS, readLayoutCache, writeLayoutCache } from './gridLayout'

interface Props {
  pageKey: string
  width: number
  children: ReactNode
}

/**
 * Mount this with `key={pageKey}` from the caller. react-grid-layout only
 * fully adopts its `layouts` prop on initial mount — a soft prop update
 * (e.g. switching tabs without remounting) is not enough to pick up a
 * different page's cached arrangement, so each page needs a fresh instance
 * rather than one shared instance juggling a changing `layouts` prop.
 *
 * Dragging/resizing is always on — grab a card by its `.drag-handle` header
 * and reorder directly, no separate edit mode to toggle first.
 */
export function PageChartGrid({ pageKey, width, children }: Props) {
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(
    () => readLayoutCache(pageKey) ?? DEFAULT_LAYOUTS,
  )

  const handleLayoutChange = (_layout: Layout, allLayouts: ResponsiveLayouts<string>) => {
    setLayouts(allLayouts)
    writeLayoutCache(pageKey, allLayouts)
  }

  return (
    <ResponsiveGridLayout
      width={width}
      layouts={layouts}
      breakpoints={DEFAULT_BREAKPOINTS}
      cols={DEFAULT_COLS}
      rowHeight={24}
      margin={[16, 16]}
      dragConfig={{ enabled: true, handle: '.drag-handle' }}
      resizeConfig={{ enabled: true, handles: ['se', 'sw', 'ne', 'nw'] }}
      onLayoutChange={handleLayoutChange}
    >
      {children}
    </ResponsiveGridLayout>
  )
}

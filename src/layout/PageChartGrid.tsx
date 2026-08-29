import { useState, type ReactNode } from 'react'
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  ResponsiveGridLayout,
  type Layout,
  type ResponsiveLayouts,
} from 'react-grid-layout'
import { DEFAULT_LAYOUT, readLayoutCache, writeLayoutCache } from './gridLayout'

interface Props {
  pageKey: string
  editing: boolean
  width: number
  children: ReactNode
}

/**
 * Mount this with `key={pageKey}` from the caller. react-grid-layout only
 * fully adopts its `layouts` prop on initial mount — a soft prop update
 * (e.g. switching tabs without remounting) is not enough to pick up a
 * different page's cached arrangement, so each page needs a fresh instance
 * rather than one shared instance juggling a changing `layouts` prop.
 */
export function PageChartGrid({ pageKey, editing, width, children }: Props) {
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(
    () => readLayoutCache(pageKey) ?? { lg: DEFAULT_LAYOUT },
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
      dragConfig={{ enabled: editing, handle: '.drag-handle' }}
      resizeConfig={{ enabled: editing }}
      onLayoutChange={handleLayoutChange}
    >
      {children}
    </ResponsiveGridLayout>
  )
}

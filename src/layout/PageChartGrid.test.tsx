import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PageChartGrid } from './PageChartGrid'
import { DEFAULT_LAYOUTS, readLayoutCache, writeLayoutCache } from './gridLayout'

vi.mock('react-grid-layout', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-grid-layout')>()
  return {
    ...actual,
    ResponsiveGridLayout: ({
      children,
      layouts,
      onLayoutChange,
    }: {
      children: React.ReactNode
      layouts: unknown
      onLayoutChange: (layout: unknown, allLayouts: unknown) => void
    }) => (
      <div>
        <button onClick={() => onLayoutChange([], { lg: [{ i: 'line', x: 0, y: 0, w: 12, h: 16 }] })}>
          simulate-drag
        </button>
        <span data-testid="layout-keys">{Object.keys(layouts as object).join(',')}</span>
        {children}
      </div>
    ),
  }
})

beforeEach(() => localStorage.clear())

describe('PageChartGrid', () => {
  it('starts from the default layout when nothing is cached', () => {
    render(
      <PageChartGrid pageKey="gdp" width={1200}>
        <div key="line">line-chart</div>
      </PageChartGrid>,
    )
    expect(screen.getByText('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('layout-keys').textContent).toBe(Object.keys(DEFAULT_LAYOUTS).join(','))
  })

  it('starts from the cached layout for that page when one exists', () => {
    const cached = { lg: [{ i: 'line', x: 0, y: 0, w: 12, h: 16 }] }
    writeLayoutCache('gdp', cached)
    render(
      <PageChartGrid pageKey="gdp" width={1200}>
        <div key="line">line-chart</div>
      </PageChartGrid>,
    )
    expect(screen.getByTestId('layout-keys').textContent).toBe('lg')
  })

  it('persists a layout change to the cache for that page', () => {
    render(
      <PageChartGrid pageKey="gdp" width={1200}>
        <div key="line">line-chart</div>
      </PageChartGrid>,
    )
    fireEvent.click(screen.getByText('simulate-drag'))
    expect(readLayoutCache('gdp')).toEqual({ lg: [{ i: 'line', x: 0, y: 0, w: 12, h: 16 }] })
  })
})

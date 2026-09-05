import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  formatCompact,
  formatFull,
  getSeriesColor,
  indicatorSuffix,
  isCurrencyIndicator,
  legendItemStyle,
  nextLegendHidden,
  useLegendSelection,
  useTooltipCenterY,
} from './chartTheme'

const KEYS = ['A', 'B', 'C']
const plain = {}
const shift = { shiftKey: true }
const ctrl = { ctrlKey: true }

describe('nextLegendHidden', () => {
  it('plain click isolates to just the clicked key', () => {
    const hidden = nextLegendHidden(new Set(), KEYS, 'B', plain)
    expect(hidden).toEqual(new Set(['A', 'C']))
  })

  it('plain click on an already-isolated key resets to all visible', () => {
    const isolated = new Set(['A', 'C'])
    expect(nextLegendHidden(isolated, KEYS, 'B', plain)).toEqual(new Set())
  })

  it('shift click from all-selected isolates to the clicked key, same as a plain click', () => {
    const hidden = nextLegendHidden(new Set(), KEYS, 'B', shift)
    expect(hidden).toEqual(new Set(['A', 'C']))
  })

  it('shift click toggles one key into the hidden set without touching others', () => {
    const hidden = nextLegendHidden(new Set(['A']), KEYS, 'B', shift)
    expect(hidden).toEqual(new Set(['A', 'B']))
  })

  it('shift click toggles a key back out of the hidden set', () => {
    const hidden = nextLegendHidden(new Set(['A', 'B']), KEYS, 'B', shift)
    expect(hidden).toEqual(new Set(['A']))
  })

  it('ctrl click always hides, even if already hidden', () => {
    const hidden = nextLegendHidden(new Set(['B']), KEYS, 'B', ctrl)
    expect(hidden).toEqual(new Set(['B']))
  })
})

describe('getSeriesColor', () => {
  it('returns the first stop for the only series', () => {
    expect(getSeriesColor(0, 1)).toBe('#9e0142')
  })

  it('returns the last stop for the last of several series', () => {
    expect(getSeriesColor(2, 3)).toBe('#5e4fa2')
  })

  it('interpolates a color for a series in between', () => {
    const color = getSeriesColor(1, 3)
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('number formatting', () => {
  it('formats large numbers compactly in English abbreviations', () => {
    expect(formatCompact(1_500_000)).toBe('1.5M')
  })

  it('formats full numbers using Indonesian grouping', () => {
    expect(formatFull(1234.5)).toBe('1.234,5')
  })
})

describe('indicator metadata lookups', () => {
  it('flags GDP as a currency indicator', () => {
    expect(isCurrencyIndicator('NY.GDP.MKTP.CD')).toBe(true)
  })

  it('does not flag an unlisted or undefined indicator as currency', () => {
    expect(isCurrencyIndicator('SP.DYN.LE00.IN')).toBe(false)
    expect(isCurrencyIndicator(undefined)).toBe(false)
  })

  it('returns the mapped suffix for a known indicator', () => {
    expect(indicatorSuffix('SP.DYN.LE00.IN')).toBe(' yrs')
  })

  it('returns an empty suffix for an unmapped or undefined indicator', () => {
    expect(indicatorSuffix('NY.GDP.MKTP.CD')).toBe('')
    expect(indicatorSuffix(undefined)).toBe('')
  })
})

describe('legendItemStyle', () => {
  it('greys out and strikes through a hidden series', () => {
    expect(legendItemStyle(true)).toMatchObject({ opacity: 0.5, textDecoration: 'line-through' })
  })

  it('leaves a visible series at full opacity with no strike-through', () => {
    expect(legendItemStyle(false)).toMatchObject({ opacity: 1, textDecoration: 'none' })
  })
})

describe('useLegendSelection', () => {
  it('isolates to the clicked series, hiding the rest', () => {
    const { result } = renderHook(() => useLegendSelection(['A', 'B']))
    expect(result.current.isHidden('A')).toBe(false)
    act(() => result.current.onLegendClick('A', {}))
    expect(result.current.isHidden('A')).toBe(false)
    expect(result.current.isHidden('B')).toBe(true)
  })
})

describe('useTooltipCenterY', () => {
  it('centers the tooltip position around the reported chart height', () => {
    const { result } = renderHook(() => useTooltipCenterY())
    expect(result.current.position.y).toBe(0)
    act(() => result.current.onResize(400, 600))
    expect(result.current.position.y).toBeGreaterThan(0)
  })

  it('does not re-render for a sub-pixel-different height', () => {
    const { result } = renderHook(() => useTooltipCenterY())
    act(() => result.current.onResize(400, 600))
    const first = result.current.position
    act(() => result.current.onResize(400, 600.2))
    expect(result.current.position).toBe(first)
  })
})

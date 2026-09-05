import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearLayoutCache,
  DEFAULT_LAYOUT,
  DEFAULT_LAYOUTS,
  readLayoutCache,
  writeLayoutCache,
} from './gridLayout'

beforeEach(() => localStorage.clear())

describe('DEFAULT_LAYOUT / DEFAULT_LAYOUTS', () => {
  it('places all four chart items in the default lg layout', () => {
    expect(DEFAULT_LAYOUT.map((i) => i.i).sort()).toEqual(['bar', 'line', 'pie', 'table'])
  })

  it('stacks single-column at narrow breakpoints, side-by-side at wide ones', () => {
    // xxs (2 cols) is narrower than 2*MIN_W: every item gets the full width.
    expect(DEFAULT_LAYOUTS.xxs!.every((i) => i.w === 2)).toBe(true)
    // lg (12 cols) is wide enough to pair items up two-per-row.
    expect(DEFAULT_LAYOUTS.lg!.find((i) => i.i === 'line')!.w).toBe(6)
  })
})

describe('layout cache', () => {
  it('returns null for a page that has never been cached', () => {
    expect(readLayoutCache('gdp')).toBeNull()
  })

  it('round-trips a written layout through the cache, keyed by page', () => {
    writeLayoutCache('gdp', DEFAULT_LAYOUTS)
    expect(readLayoutCache('gdp')).toEqual(DEFAULT_LAYOUTS)
    expect(readLayoutCache('inflation')).toBeNull()
  })

  it('clears only the requested page', () => {
    writeLayoutCache('gdp', DEFAULT_LAYOUTS)
    writeLayoutCache('inflation', DEFAULT_LAYOUTS)
    clearLayoutCache('gdp')
    expect(readLayoutCache('gdp')).toBeNull()
    expect(readLayoutCache('inflation')).not.toBeNull()
  })

  it('falls back to an empty cache when localStorage holds malformed JSON', () => {
    localStorage.setItem('layout.v1', '{not json')
    expect(readLayoutCache('gdp')).toBeNull()
  })

  it('does not throw when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => writeLayoutCache('gdp', DEFAULT_LAYOUTS)).not.toThrow()
    expect(() => clearLayoutCache('gdp')).not.toThrow()
    spy.mockRestore()
  })
})

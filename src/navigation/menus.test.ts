import { describe, expect, it } from 'vitest'
import { findTabByIndicator, MENUS } from './menus'

describe('findTabByIndicator', () => {
  it('finds the menu and tab for a known indicator code', () => {
    const result = findTabByIndicator('SP.DYN.LE00.IN')
    expect(result?.menu.key).toBe('health')
    expect(result?.tab.key).toBe('life-expectancy')
  })

  it('returns undefined for an indicator no tab declares', () => {
    expect(findTabByIndicator('NOT.A.REAL.CODE')).toBeUndefined()
  })

  it('every tab has a unique indicator code', () => {
    const codes = MENUS.flatMap((m) => m.tabs.map((t) => t.indicatorCode))
    expect(new Set(codes).size).toBe(codes.length)
  })
})

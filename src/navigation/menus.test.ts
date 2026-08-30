import { describe, expect, it } from 'vitest'
import { resolveRoute, MENUS } from './menus'

describe('resolveRoute', () => {
  it('resolves a known menu and tab from the path and query', () => {
    const result = resolveRoute('/health', 'life-expectancy')
    expect(result.menu.key).toBe('health')
    expect(result.tab.key).toBe('life-expectancy')
  })

  it('falls back to the first tab when the tab param is missing or unknown', () => {
    expect(resolveRoute('/health', null).tab.key).toBe('life-expectancy')
    expect(resolveRoute('/health', 'not-a-tab').tab.key).toBe('life-expectancy')
  })

  it('falls back to the first menu for an unknown or root path', () => {
    expect(resolveRoute('/', null).menu.key).toBe('economy')
    expect(resolveRoute('/nope', null).menu.key).toBe('economy')
  })

  it('every tab has a unique indicator code', () => {
    const codes = MENUS.flatMap((m) => m.tabs.map((t) => t.indicatorCode))
    expect(new Set(codes).size).toBe(codes.length)
  })
})

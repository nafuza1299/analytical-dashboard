import { describe, expect, it } from 'vitest'
import { nextLegendHidden } from './chartTheme'

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

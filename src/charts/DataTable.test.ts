import { describe, expect, it } from 'vitest'
import { computeVisibleRange } from './DataTable'

const ROW_HEIGHT = 37
const OVERSCAN = 5
const CONTAINER_HEIGHT = 420
const TOTAL_ROWS = 40

describe('computeVisibleRange', () => {
  it('scrolled to top starts at 0 with no negative overscan', () => {
    const { start, end } = computeVisibleRange(0, CONTAINER_HEIGHT, ROW_HEIGHT, OVERSCAN, TOTAL_ROWS)
    expect(start).toBe(0)
    expect(end).toBeGreaterThan(0)
    expect(end).toBeLessThanOrEqual(TOTAL_ROWS)
  })

  it('scrolled to the middle applies overscan on both sides', () => {
    const scrollTop = 10 * ROW_HEIGHT
    const { start, end } = computeVisibleRange(scrollTop, CONTAINER_HEIGHT, ROW_HEIGHT, OVERSCAN, TOTAL_ROWS)
    expect(start).toBe(10 - OVERSCAN)
    expect(end).toBe(10 + Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + OVERSCAN)
  })

  it('scrolled near the end clamps end to totalRows', () => {
    const scrollTop = 38 * ROW_HEIGHT
    const { start, end } = computeVisibleRange(scrollTop, CONTAINER_HEIGHT, ROW_HEIGHT, OVERSCAN, TOTAL_ROWS)
    expect(end).toBe(TOTAL_ROWS)
    expect(start).toBeLessThan(end)
  })

  it('fewer rows than one viewport clamps both bounds to totalRows', () => {
    const { start, end } = computeVisibleRange(0, CONTAINER_HEIGHT, ROW_HEIGHT, OVERSCAN, 3)
    expect(start).toBe(0)
    expect(end).toBe(3)
  })
})

import { describe, expect, it } from 'vitest'
import { isAdditiveIndicator } from './additiveIndicators'

describe('isAdditiveIndicator', () => {
  it('is true for an absolute-count indicator like GDP', () => {
    expect(isAdditiveIndicator('NY.GDP.MKTP.CD')).toBe(true)
  })

  it('is false for a rate/percentage indicator like inflation', () => {
    expect(isAdditiveIndicator('FP.CPI.TOTL.ZG')).toBe(false)
  })
})

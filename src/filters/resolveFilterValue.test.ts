import { describe, expect, it } from 'vitest'
import { countriesFilter, yearRangeFilter } from './registry'
import { resolveFilterValue } from './resolveFilterValue'

describe('resolveFilterValue', () => {
  it('prefers a valid cached value over default', () => {
    const result = resolveFilterValue(countriesFilter, { countries: 'SGP,MYS' }, ['countries'])
    expect(result).toEqual(['SGP', 'MYS'])
  })

  it('falls back to default when the cached value is malformed', () => {
    const result = resolveFilterValue(countriesFilter, { countries: '???' }, ['countries'])
    expect(result).toEqual(countriesFilter.default)
  })

  it('ignores cache for a filter the current page does not declare', () => {
    const result = resolveFilterValue(countriesFilter, { countries: 'VNM' }, [])
    expect(result).toEqual(countriesFilter.default)
  })

  it('falls back to default when cache is absent', () => {
    const result = resolveFilterValue(yearRangeFilter, null, ['yearRange'])
    expect(result).toEqual(yearRangeFilter.default)
  })

  it('rejects a year range with start after end, or outside bounds', () => {
    expect(yearRangeFilter.parse('2024:2015')).toBeNull()
    expect(yearRangeFilter.parse('1900:2020')).toBeNull()
    expect(yearRangeFilter.parse('2015:2020')).toEqual([2015, 2020])
  })

  it('never crashes on a malformed cached value', () => {
    expect(() => resolveFilterValue(countriesFilter, { countries: '<script>' }, ['countries'])).not.toThrow()
  })

  it('falls back to default when a cached value is not a string at all', () => {
    // The cache is JSON, so its declared `string` values aren't enforced at
    // runtime — a stale or hand-edited `filters.v1` holding the *parsed*
    // shape (`yearRange: [2015, 2023]`) used to reach `raw.split(...)` and
    // crash the app instead of resolving to the default.
    const cached = { countries: ['SGP', 'MYS'], yearRange: [2015, 2023] } as never
    expect(resolveFilterValue(countriesFilter, cached, ['countries'])).toEqual(countriesFilter.default)
    expect(resolveFilterValue(yearRangeFilter, cached, ['yearRange'])).toEqual(yearRangeFilter.default)
  })
})

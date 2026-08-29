import { describe, expect, it } from 'vitest'
import { countriesFilter, yearRangeFilter } from './registry'
import { resolveFilterValue } from './resolveFilterValue'

describe('resolveFilterValue', () => {
  it('prefers a valid URL param over cache and default', () => {
    const result = resolveFilterValue(
      countriesFilter,
      new URLSearchParams('countries=SGP,MYS'),
      { countries: 'IDN' },
      ['countries'],
    )
    expect(result).toEqual(['SGP', 'MYS'])
  })

  it('falls back to cache when the URL param is malformed', () => {
    const result = resolveFilterValue(
      countriesFilter,
      new URLSearchParams('countries=???'),
      { countries: 'VNM' },
      ['countries'],
    )
    expect(result).toEqual(['VNM'])
  })

  it('ignores cache for a filter the current page does not declare', () => {
    const result = resolveFilterValue(
      countriesFilter,
      new URLSearchParams(''),
      { countries: 'VNM' },
      [], // page doesn't use 'countries'
    )
    expect(result).toEqual(countriesFilter.default)
  })

  it('falls back to default when both URL and cache are absent/invalid', () => {
    const result = resolveFilterValue(
      yearRangeFilter,
      new URLSearchParams('yearRange=not-a-range'),
      null,
      ['yearRange'],
    )
    expect(result).toEqual(yearRangeFilter.default)
  })

  it('rejects a year range with start after end, or outside bounds', () => {
    expect(yearRangeFilter.parse('2024:2015')).toBeNull()
    expect(yearRangeFilter.parse('1900:2020')).toBeNull()
    expect(yearRangeFilter.parse('2015:2020')).toEqual([2015, 2020])
  })

  it('never crashes on a malformed shared-link param', () => {
    expect(() =>
      resolveFilterValue(
        countriesFilter,
        new URLSearchParams('countries=' + encodeURIComponent('<script>')),
        null,
        ['countries'],
      ),
    ).not.toThrow()
  })
})

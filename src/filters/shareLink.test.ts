import { describe, expect, it } from 'vitest'
import { buildShareUrl, decodeShareToken, encodeShareToken } from './shareLink'
import type { FilterValues } from './registry'

const values: FilterValues = { countries: ['IDN', 'SGP'], yearRange: [2015, 2024] }

describe('encodeShareToken / decodeShareToken', () => {
  it('round-trips filter values through the token', () => {
    const token = encodeShareToken(values)
    expect(decodeShareToken(token)).toEqual({ countries: 'IDN,SGP', yearRange: '2015:2024' })
  })

  it('returns null for a token that is not valid base64', () => {
    expect(decodeShareToken('not-base64!!!')).toBeNull()
  })
})

describe('buildShareUrl', () => {
  it('includes a filter token when includeFilters is true', () => {
    const url = buildShareUrl('economy', 'gdp', values, true)
    const parsed = new URL(url)
    expect(parsed.pathname).toBe('/economy')
    expect(parsed.searchParams.get('tab')).toBe('gdp')
    expect(parsed.searchParams.get('filter')).toBe(encodeShareToken(values))
  })

  it('omits the filter token when includeFilters is false', () => {
    const url = buildShareUrl('economy', 'gdp', values, false)
    expect(new URL(url).searchParams.has('filter')).toBe(false)
  })
})

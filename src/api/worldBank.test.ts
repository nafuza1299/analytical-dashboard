import { describe, expect, it } from 'vitest'
import { normalizeWorldBankResponse } from './worldBank'

describe('normalizeWorldBankResponse', () => {
  it('maps data points to the canonical row shape', () => {
    const rows = normalizeWorldBankResponse([
      { page: 1, pages: 1, per_page: 1000, total: 1 },
      [
        {
          indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' },
          country: { id: 'ID', value: 'Indonesia' },
          countryiso3code: 'IDN',
          date: '2023',
          value: 1371171725450.71,
        },
      ],
    ])

    expect(rows).toEqual([
      {
        countryCode: 'IDN',
        countryName: 'Indonesia',
        indicatorCode: 'NY.GDP.MKTP.CD',
        indicatorName: 'GDP (current US$)',
        year: 2023,
        value: 1371171725450.71,
      },
    ])
  })

  it('keeps null values as null instead of dropping or zeroing them', () => {
    const rows = normalizeWorldBankResponse([
      { page: 1, pages: 1, per_page: 1000, total: 1 },
      [
        {
          indicator: { id: 'SP.DYN.LE00.IN', value: 'Life expectancy at birth' },
          country: { id: 'KP', value: 'Korea, Dem. People\'s Rep.' },
          countryiso3code: 'PRK',
          date: '2023',
          value: null,
        },
      ],
    ])

    expect(rows[0].value).toBeNull()
  })

  it('returns an empty array when the API finds no matching data', () => {
    const rows = normalizeWorldBankResponse([{ page: 1, pages: 1, per_page: 1000, total: 0 }, null])
    expect(rows).toEqual([])
  })
})

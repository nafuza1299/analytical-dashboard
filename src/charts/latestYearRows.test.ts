import { describe, expect, it } from 'vitest'
import type { DataRow } from '../api/worldBank'
import { latestYearRows } from './latestYearRows'

const row = (over: Partial<DataRow>): DataRow => ({
  countryCode: 'IDN',
  countryName: 'Indonesia',
  indicatorCode: 'X',
  indicatorName: 'X',
  year: 2020,
  value: 1,
  ...over,
})

describe('latestYearRows', () => {
  it('picks the most recent year that actually has data, skipping a trailing null year', () => {
    const rows = [
      row({ countryCode: 'IDN', year: 2022, value: 10 }),
      row({ countryCode: 'SGP', year: 2022, value: 20 }),
      // 2023 exists but every value is null (not yet published) — should be skipped
      row({ countryCode: 'IDN', year: 2023, value: null }),
      row({ countryCode: 'SGP', year: 2023, value: null }),
    ]
    const result = latestYearRows(rows)
    expect(result.map((r) => r.year)).toEqual([2022, 2022])
  })

  it('returns an empty array when no row has data', () => {
    expect(latestYearRows([row({ value: null })])).toEqual([])
  })
})

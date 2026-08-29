import { describe, expect, it } from 'vitest'
import type { DataRow } from '../api/worldBank'
import { pivotByYear } from './pivotByYear'

const row = (over: Partial<DataRow>): DataRow => ({
  countryCode: 'IDN',
  countryName: 'Indonesia',
  indicatorCode: 'X',
  indicatorName: 'X',
  year: 2020,
  value: 1,
  ...over,
})

describe('pivotByYear', () => {
  it('groups rows by year with one column per country', () => {
    const result = pivotByYear([
      row({ countryCode: 'IDN', year: 2020, value: 10 }),
      row({ countryCode: 'SGP', year: 2020, value: 20 }),
      row({ countryCode: 'IDN', year: 2021, value: 11 }),
    ])
    expect(result).toEqual([
      { year: 2020, IDN: 10, SGP: 20 },
      { year: 2021, IDN: 11 },
    ])
  })

  it('keeps null values instead of dropping them, so the chart can render a gap', () => {
    const result = pivotByYear([row({ value: null })])
    expect(result).toEqual([{ year: 2020, IDN: null }])
  })

  it('sorts by year ascending regardless of input order', () => {
    const result = pivotByYear([row({ year: 2022 }), row({ year: 2020 })])
    expect(result.map((r) => r.year)).toEqual([2020, 2022])
  })
})

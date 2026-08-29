import { describe, expect, it } from 'vitest'
import { buildExportFilename } from './exportToExcel'

describe('buildExportFilename', () => {
  it('slugifies punctuation out of the indicator name', () => {
    expect(buildExportFilename('GDP (current US$)', ['IDN', 'SGP', 'MYS'], [2015, 2024], 'line')).toBe(
      'gdp-current-us_idn-sgp-mys_2015-2024_line.xlsx',
    )
  })

  it('lowercases country codes and joins them with the year range and chart kind', () => {
    expect(buildExportFilename('Life expectancy at birth', ['VNM'], [2000, 2020], 'bar')).toBe(
      'life-expectancy-at-birth_vnm_2000-2020_bar.xlsx',
    )
  })
})

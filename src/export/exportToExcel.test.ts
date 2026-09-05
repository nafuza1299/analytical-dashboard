import { describe, expect, it, vi } from 'vitest'
import { buildExportFilename, exportRowsToExcel } from './exportToExcel'
import type { DataRow } from '../api/worldBank'

const { jsonToSheetMock, bookNewMock, appendSheetMock, writeFileMock } = vi.hoisted(() => ({
  jsonToSheetMock: vi.fn().mockReturnValue('sheet'),
  bookNewMock: vi.fn().mockReturnValue('workbook'),
  appendSheetMock: vi.fn(),
  writeFileMock: vi.fn(),
}))

vi.mock('xlsx', () => ({
  utils: { json_to_sheet: jsonToSheetMock, book_new: bookNewMock, book_append_sheet: appendSheetMock },
  writeFile: writeFileMock,
}))

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

  it('uses the given extension instead of defaulting to xlsx', () => {
    expect(buildExportFilename('GDP', ['IDN'], [2015, 2024], 'line', 'png')).toBe(
      'gdp_idn_2015-2024_line.png',
    )
  })
})

describe('exportRowsToExcel', () => {
  it('maps rows to sheet columns, substituting "No data" for a null value', () => {
    const rows: DataRow[] = [
      { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 100 },
      { countryCode: 'SGP', countryName: 'Singapore', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: null },
    ]

    exportRowsToExcel(rows, 'gdp.xlsx')

    expect(jsonToSheetMock).toHaveBeenCalledWith([
      { Country: 'Indonesia', 'Country Code': 'IDN', Year: 2023, Indicator: 'GDP', Value: 100 },
      { Country: 'Singapore', 'Country Code': 'SGP', Year: 2023, Indicator: 'GDP', Value: 'No data' },
    ])
    expect(appendSheetMock).toHaveBeenCalledWith('workbook', 'sheet', 'Data')
    expect(writeFileMock).toHaveBeenCalledWith('workbook', 'gdp.xlsx')
  })
})

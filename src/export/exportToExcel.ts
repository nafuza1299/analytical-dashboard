import * as XLSX from 'xlsx'
import type { DataRow } from '../api/worldBank'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildExportFilename(
  indicatorName: string,
  countries: string[],
  yearRange: [number, number],
  kind: string,
): string {
  const indicatorSlug = slugify(indicatorName)
  const countrySlug = countries.map((c) => c.toLowerCase()).join('-')
  return `${indicatorSlug}_${countrySlug}_${yearRange[0]}-${yearRange[1]}_${kind}.xlsx`
}

/** Exports the same normalized rows a chart renders — never the raw API response. */
export function exportRowsToExcel(rows: DataRow[], filename: string) {
  const sheetRows = rows.map((r) => ({
    Country: r.countryName,
    'Country Code': r.countryCode,
    Year: r.year,
    Indicator: r.indicatorName,
    Value: r.value ?? 'No data',
  }))
  const sheet = XLSX.utils.json_to_sheet(sheetRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Data')
  XLSX.writeFile(workbook, filename)
}

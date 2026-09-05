import * as XLSX from 'xlsx'
import type { DataRow } from '../api/worldBank'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Keeps whole words, so a long indicator name truncates to a readable prefix. */
function truncateSlug(slug: string, max: number): string {
  if (slug.length <= max) return slug
  const cut = slug.slice(0, max)
  const lastDash = cut.lastIndexOf('-')
  return lastDash > 0 ? cut.slice(0, lastDash) : cut
}

export function buildExportFilename(
  indicatorName: string,
  countries: string[],
  yearRange: [number, number],
  kind: string,
  ext: 'xlsx' | 'png' | 'pdf' = 'xlsx',
): string {
  const indicatorSlug = truncateSlug(slugify(indicatorName), 24)
  const countrySlug =
    countries.length > 3
      ? `${countries.length}-countries`
      : countries.map((c) => c.toLowerCase()).join('-')
  return `${indicatorSlug}_${countrySlug}_${yearRange[0]}-${yearRange[1]}_${kind}.${ext}`
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

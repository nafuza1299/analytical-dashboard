import type { DataRow } from '../api/worldBank'

export type YearRow = { year: number } & Record<string, number | null>

/** One row per year, one column per country code — what Recharts' <Line> needs. */
export function pivotByYear(rows: DataRow[]): YearRow[] {
  const byYear = new Map<number, YearRow>()
  for (const row of rows) {
    const entry = byYear.get(row.year) ?? ({ year: row.year } as YearRow)
    entry[row.countryCode] = row.value
    byYear.set(row.year, entry)
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year)
}

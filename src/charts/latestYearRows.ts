import type { DataRow } from '../api/worldBank'

/** Rows for the most recent year that actually has data, not just the max of the filter range. */
export function latestYearRows(rows: DataRow[]): DataRow[] {
  const yearsWithData = rows.filter((r) => r.value !== null).map((r) => r.year)
  if (yearsWithData.length === 0) return []
  const latestYear = Math.max(...yearsWithData)
  return rows.filter((r) => r.year === latestYear)
}

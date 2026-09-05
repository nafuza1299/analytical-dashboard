import { useMemo, useRef, useState } from 'react'
import type { DataRow } from '../api/worldBank'
import { formatFull, indicatorSuffix, isCurrencyIndicator } from './chartTheme'

type SortDir = 'asc' | 'desc'

// ponytail: assumes every row is exactly ROW_HEIGHT tall (single line of
// text-sm in px-3 py-2 cells) — if a cell ever wraps to multiple lines or
// row height becomes dynamic, switch to measuring real row height (or a
// virtualization library) instead of this fixed constant.
const ROW_HEIGHT = 37
const OVERSCAN = 5
const CONTAINER_HEIGHT = 420

interface Props {
  rows: DataRow[]
  yearRange: [number, number]
}

interface CountryRow {
  countryCode: string
  countryName: string
  values: Map<number, number | null>
}

export function computeVisibleRange(
  scrollTop: number,
  containerHeight: number,
  rowHeight: number,
  overscan: number,
  totalRows: number,
): { start: number; end: number } {
  const clamp = (n: number) => Math.min(Math.max(n, 0), totalRows)
  const start = clamp(Math.floor(scrollTop / rowHeight) - overscan)
  const end = clamp(start + Math.ceil(containerHeight / rowHeight) + 2 * overscan)
  return { start, end }
}

export function DataTable({ rows, yearRange }: Props) {
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isCurrency = isCurrencyIndicator(rows[0]?.indicatorCode)
  const suffix = indicatorSuffix(rows[0]?.indicatorCode)

  const years = useMemo(() => {
    const [start, end] = yearRange
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [yearRange])

  const countryRows = useMemo(() => {
    const byCountry = new Map<string, CountryRow>()
    for (const row of rows) {
      let entry = byCountry.get(row.countryCode)
      if (!entry) {
        entry = { countryCode: row.countryCode, countryName: row.countryName, values: new Map() }
        byCountry.set(row.countryCode, entry)
      }
      entry.values.set(row.year, row.value)
    }
    return Array.from(byCountry.values())
  }, [rows])

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...countryRows].sort((a, b) => a.countryName.localeCompare(b.countryName) * dir)
  }, [countryRows, sortDir])

  const { start, end } = computeVisibleRange(scrollTop, CONTAINER_HEIGHT, ROW_HEIGHT, OVERSCAN, sorted.length)
  const visibleRows = sorted.slice(start, end)
  const topPadding = start * ROW_HEIGHT
  const bottomPadding = (sorted.length - end) * ROW_HEIGHT

  const toggleSort = () => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    setScrollTop(0)
    if (containerRef.current) containerRef.current.scrollTop = 0
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: CONTAINER_HEIGHT }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-surface border-b border-border">
            <tr>
              <th className="sticky left-0 z-10 bg-surface text-left px-3 py-2 text-sm font-semibold text-text whitespace-nowrap">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                  onClick={toggleSort}
                >
                  Country
                  {sortDir === 'asc' ? '▲' : '▼'}
                </button>
              </th>
              {years.map((year) => (
                <th
                  key={year}
                  className="text-left px-3 py-2 text-sm font-semibold text-text whitespace-nowrap"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPadding > 0 && (
              <tr>
                <td colSpan={years.length + 1} style={{ height: topPadding, padding: 0, border: 'none' }} />
              </tr>
            )}
            {visibleRows.map((row) => (
              <tr key={row.countryCode} className="border-b border-border hover:bg-surface-hover group">
                <td className="sticky left-0 z-10 bg-surface group-hover:bg-surface-hover px-3 py-2 text-sm text-text whitespace-nowrap">
                  {row.countryName}
                </td>
                {years.map((year) => {
                  const value = row.values.get(year) ?? null
                  return (
                    <td key={year} className="px-3 py-2 text-sm text-text whitespace-nowrap">
                      {value === null ? (
                        <span className="text-text-muted italic">No data</span>
                      ) : (
                        <>
                          {isCurrency && '$'}
                          {formatFull(value)}
                          {suffix}
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {bottomPadding > 0 && (
              <tr>
                <td colSpan={years.length + 1} style={{ height: bottomPadding, padding: 0, border: 'none' }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-text-muted">
        {sorted.length === 0 ? 'No rows' : `${sorted.length} ${sorted.length === 1 ? 'country' : 'countries'}`}
      </div>
    </div>
  )
}

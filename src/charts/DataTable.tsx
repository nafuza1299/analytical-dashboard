import { useMemo, useState } from 'react'
import type { DataRow } from '../api/worldBank'
import { Button } from '../catalyst-ui/components/Button/Button'
import { formatFull } from './chartTheme'

type SortKey = 'countryName' | 'year' | 'value'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'countryName', label: 'Country' },
  { key: 'year', label: 'Year' },
  { key: 'value', label: 'Value' },
]

interface Props {
  rows: DataRow[]
}

export function DataTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('year')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      if (sortKey === 'value') {
        // nulls always sort last, regardless of direction
        if (a.value === null || b.value === null) return a.value === b.value ? 0 : a.value === null ? 1 : -1
        return (a.value - b.value) * dir
      }
      if (sortKey === 'year') return (a.year - b.year) * dir
      return a.countryName.localeCompare(b.countryName) * dir
    })
  }, [rows, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const clampedPage = Math.min(page, pageCount - 1)
  const pageRows = sorted.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b border-border">
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th key={key} className="text-left px-3 py-2 text-sm font-semibold text-text">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                    onClick={() => toggleSort(key)}
                  >
                    {label}
                    {sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={`${row.countryCode}-${row.year}`}
                className="border-b border-border hover:bg-surface-hover"
              >
                <td className="px-3 py-2 text-sm text-text">{row.countryName}</td>
                <td className="px-3 py-2 text-sm text-text">{row.year}</td>
                <td className="px-3 py-2 text-sm text-text">
                  {row.value === null ? (
                    <span className="text-text-muted italic">No data</span>
                  ) : (
                    formatFull(row.value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm text-text-muted">
        <span>
          {sorted.length === 0
            ? 'No rows'
            : `${clampedPage * PAGE_SIZE + 1}-${Math.min((clampedPage + 1) * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={clampedPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={clampedPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

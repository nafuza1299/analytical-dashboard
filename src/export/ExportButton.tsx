import { Button } from '../catalyst-ui/components/Button/Button'
import type { DataRow } from '../api/worldBank'
import { exportRowsToExcel } from './exportToExcel'

interface Props {
  rows: DataRow[]
  filename: string
}

export function ExportButton({ rows, filename }: Props) {
  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      disabled={rows.length === 0}
      aria-label="Export .xlsx"
      onClick={() => exportRowsToExcel(rows, filename)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    </Button>
  )
}

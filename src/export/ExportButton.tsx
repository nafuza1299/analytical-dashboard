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
      disabled={rows.length === 0}
      onClick={() => exportRowsToExcel(rows, filename)}
    >
      Export .xlsx
    </Button>
  )
}

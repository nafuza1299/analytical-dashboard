import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExportButton } from './ExportButton'
import type { DataRow } from '../api/worldBank'

const { exportRowsToExcelMock } = vi.hoisted(() => ({ exportRowsToExcelMock: vi.fn() }))
vi.mock('./exportToExcel', () => ({ exportRowsToExcel: exportRowsToExcelMock }))

const rows: DataRow[] = [
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'X', indicatorName: 'X', year: 2023, value: 1 },
]

describe('ExportButton', () => {
  it('exports the given rows under the given filename when clicked', () => {
    render(<ExportButton rows={rows} filename="gdp.xlsx" />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(exportRowsToExcelMock).toHaveBeenCalledWith(rows, 'gdp.xlsx')
  })

  it('is disabled when there are no rows to export', () => {
    render(<ExportButton rows={[]} filename="gdp.xlsx" />)
    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled()
  })
})

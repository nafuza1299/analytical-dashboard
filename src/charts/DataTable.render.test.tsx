import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable'
import type { DataRow } from '../api/worldBank'

const rows: DataRow[] = [
  { countryCode: 'SGP', countryName: 'Singapore', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 500 },
  { countryCode: 'SGP', countryName: 'Singapore', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2022, value: 400 },
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 1000 },
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2022, value: null },
]

describe('DataTable', () => {
  it('renders one row per country and one column per year, prefixed with $ for a currency indicator', () => {
    render(<DataTable rows={rows} yearRange={[2022, 2023]} />)
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
    expect(screen.getByText('Singapore')).toBeInTheDocument()
    expect(screen.getByText('$1.000')).toBeInTheDocument()
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('2 countries')).toBeInTheDocument()
  })

  it('does not prefix $ for a non-currency indicator, and appends its unit suffix', () => {
    const lifeRows: DataRow[] = [
      { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'SP.DYN.LE00.IN', indicatorName: 'Life exp', year: 2023, value: 72 },
    ]
    render(<DataTable rows={lifeRows} yearRange={[2023, 2023]} />)
    expect(screen.getByText('72 yrs')).toBeInTheDocument()
  })

  it('toggles sort direction when the Country header is clicked', () => {
    render(<DataTable rows={rows} yearRange={[2022, 2023]} />)
    const countryNames = () => screen.getAllByRole('row').slice(1).map((r) => r.textContent?.slice(0, 2))
    expect(countryNames()).toEqual(['In', 'Si'])
    fireEvent.click(screen.getByRole('button', { name: /Country/ }))
    expect(countryNames()).toEqual(['Si', 'In'])
  })

  it('shows "No rows" when given no data', () => {
    render(<DataTable rows={[]} yearRange={[2023, 2023]} />)
    expect(screen.getByText('No rows')).toBeInTheDocument()
  })
})

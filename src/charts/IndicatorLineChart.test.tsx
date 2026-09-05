import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IndicatorLineChart } from './IndicatorLineChart'
import type { DataRow } from '../api/worldBank'

const rows: DataRow[] = [
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'SP.DYN.LE00.IN', indicatorName: 'Life exp', year: 2022, value: 70 },
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'SP.DYN.LE00.IN', indicatorName: 'Life exp', year: 2023, value: 71 },
  { countryCode: 'SGP', countryName: 'Singapore', indicatorCode: 'SP.DYN.LE00.IN', indicatorName: 'Life exp', year: 2023, value: 83 },
]

describe('IndicatorLineChart', () => {
  it('renders one line per country', () => {
    const { container } = render(<IndicatorLineChart rows={rows} />)
    expect(container.querySelectorAll('.recharts-line')).toHaveLength(2)
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
    expect(screen.getByText('Singapore')).toBeInTheDocument()
  })

  it('isolates to a series when its legend item is clicked', () => {
    render(<IndicatorLineChart rows={rows} />)
    fireEvent.click(screen.getByText('Indonesia'))
    // Isolating to Indonesia strikes through the now-hidden Singapore entry.
    expect(screen.getByText('Singapore')).toHaveStyle({ textDecoration: 'line-through' })
    expect(screen.getByText('Indonesia')).toHaveStyle({ textDecoration: 'none' })
  })
})

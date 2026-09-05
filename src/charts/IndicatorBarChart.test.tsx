import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IndicatorBarChart } from './IndicatorBarChart'
import type { DataRow } from '../api/worldBank'

const rows: DataRow[] = [
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2022, value: 500 },
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 600 },
  { countryCode: 'SGP', countryName: 'Singapore', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 400 },
]

describe('IndicatorBarChart', () => {
  it('renders one bar per country using only the latest year with data', () => {
    const { container } = render(<IndicatorBarChart rows={rows} />)
    const bars = container.querySelectorAll('.recharts-bar-rectangle')
    expect(bars.length).toBe(2)
  })

  it('renders nothing when there are no rows with data for any year', () => {
    const noDataRows: DataRow[] = [
      { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'X', indicatorName: 'X', year: 2023, value: null },
    ]
    const { container } = render(<IndicatorBarChart rows={noDataRows} />)
    expect(container).toBeEmptyDOMElement()
  })
})

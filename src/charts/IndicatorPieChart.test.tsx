import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IndicatorPieChart } from './IndicatorPieChart'
import type { DataRow } from '../api/worldBank'

const rows: DataRow[] = [
  { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 600 },
  { countryCode: 'SGP', countryName: 'Singapore', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 400 },
]

describe('IndicatorPieChart', () => {
  it('renders a slice per country for an additive indicator', () => {
    const { container } = render(<IndicatorPieChart rows={rows} indicatorCode="NY.GDP.MKTP.CD" />)
    expect(screen.getByText('Share of total (2023)')).toBeInTheDocument()
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(2)
  })

  it('renders nothing for a non-additive indicator', () => {
    const { container } = render(<IndicatorPieChart rows={rows} indicatorCode="FP.CPI.TOTL.ZG" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when there is no positive-value data for the latest year', () => {
    const zeroRows: DataRow[] = [
      { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP', year: 2023, value: 0 },
    ]
    const { container } = render(<IndicatorPieChart rows={zeroRows} indicatorCode="NY.GDP.MKTP.CD" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('clicking a legend entry isolates to that country, hiding the rest', () => {
    const { container } = render(<IndicatorPieChart rows={rows} indicatorCode="NY.GDP.MKTP.CD" />)
    const legend = within(container.querySelector('.recharts-legend-wrapper')!)
    fireEvent.click(legend.getByText('Singapore'))
    expect(legend.getByText('Singapore')).toHaveStyle({ textDecoration: 'none' })
    expect(legend.getByText('Indonesia')).toHaveStyle({ textDecoration: 'line-through' })
  })
})

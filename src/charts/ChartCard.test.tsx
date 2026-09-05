import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChartCard } from './ChartCard'

vi.mock('../export/ExportButton', () => ({ ExportButton: () => <div>export-button</div> }))
vi.mock('../export/CaptureButton', () => ({ CaptureButton: () => <div>capture-button</div> }))

const baseProps = {
  title: 'GDP over time',
  periodLabel: '2015–2024',
  exportRows: [],
  exportFilename: 'gdp.xlsx',
  captureFilename: 'gdp.png',
}

describe('ChartCard', () => {
  it('renders the title, period label, and children', () => {
    render(
      <ChartCard {...baseProps} canCapture={false}>
        <div>chart-body</div>
      </ChartCard>,
    )
    expect(screen.getByText('GDP over time')).toBeInTheDocument()
    expect(screen.getByText('2015–2024')).toBeInTheDocument()
    expect(screen.getByText('chart-body')).toBeInTheDocument()
    expect(screen.getByText('export-button')).toBeInTheDocument()
  })

  it('shows the capture button only when canCapture is true', () => {
    const { rerender } = render(
      <ChartCard {...baseProps} canCapture={false}>
        <div />
      </ChartCard>,
    )
    expect(screen.queryByText('capture-button')).not.toBeInTheDocument()

    rerender(
      <ChartCard {...baseProps} canCapture>
        <div />
      </ChartCard>,
    )
    expect(screen.getByText('capture-button')).toBeInTheDocument()
  })

  it('shows the legend help icon only when hasInteractiveLegend is set', () => {
    render(
      <ChartCard {...baseProps} canCapture={false} hasInteractiveLegend>
        <div />
      </ChartCard>,
    )
    expect(screen.getByText(/Click a legend item to isolate it/)).toBeInTheDocument()
  })
})

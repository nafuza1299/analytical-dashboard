import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ThemeProvider } from './catalyst-ui/theme/ThemeProvider'

const { fetchIndicatorDataMock } = vi.hoisted(() => ({ fetchIndicatorDataMock: vi.fn() }))
vi.mock('./api/worldBank', () => ({ fetchIndicatorData: fetchIndicatorDataMock }))

vi.mock('./charts/IndicatorLineChart', () => ({ IndicatorLineChart: () => <div>line-chart</div> }))
vi.mock('./charts/IndicatorBarChart', () => ({ IndicatorBarChart: () => <div>bar-chart</div> }))
vi.mock('./charts/IndicatorPieChart', () => ({ IndicatorPieChart: () => <div>pie-chart</div> }))
vi.mock('./charts/DataTable', () => ({ DataTable: () => <div>data-table</div> }))
vi.mock('./export/CaptureButton', () => ({ CaptureButton: () => <button>capture</button> }))
vi.mock('./export/ExportButton', () => ({ ExportButton: () => <button>export</button> }))
vi.mock('./export/ShareButton', () => ({ ShareButton: () => <button>share</button> }))

const row = (overrides: Partial<Record<string, unknown>> = {}) => ({
  countryCode: 'IDN',
  countryName: 'Indonesia',
  indicatorCode: 'NY.GDP.MKTP.CD',
  indicatorName: 'GDP (current US$)',
  year: 2023,
  value: 100,
  ...overrides,
})

function renderApp() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.stubGlobal('innerWidth', 1280)
})

describe('App', () => {
  it('redirects a bare "/" to the canonical economy/gdp route', async () => {
    fetchIndicatorDataMock.mockReturnValue(new Promise(() => {}))
    renderApp()
    expect(await screen.findAllByLabelText('Loading card')).not.toHaveLength(0)
    expect(window.location.pathname + window.location.search).toBe('/economy?tab=gdp')
  })

  it('shows an error message with a working Retry button', async () => {
    fetchIndicatorDataMock.mockRejectedValue(new Error('World Bank API request failed: 500 Server Error'))
    renderApp()
    expect(await screen.findByText(/Couldn't load gdp data/)).toBeInTheDocument()
    expect(screen.getByText('World Bank API request failed: 500 Server Error')).toBeInTheDocument()

    fetchIndicatorDataMock.mockResolvedValueOnce([row()])
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('line-chart')).toBeInTheDocument()
  })

  it('shows a prompt instead of querying when every country is deselected', async () => {
    window.history.replaceState(null, '', '/?tab=gdp')
    localStorage.setItem('filters.v1', JSON.stringify({ countries: '' }))
    renderApp()
    expect(await screen.findByText('No countries selected')).toBeInTheDocument()
    expect(fetchIndicatorDataMock).not.toHaveBeenCalled()
  })

  it('shows a no-data message when the API returns an empty result', async () => {
    fetchIndicatorDataMock.mockResolvedValue([])
    renderApp()
    expect(await screen.findByText(/No data for this selection/)).toBeInTheDocument()
  })

  it('renders all four chart cards once data loads, with page-level export controls', async () => {
    fetchIndicatorDataMock.mockResolvedValue([row()])
    renderApp()

    expect(await screen.findByText('line-chart')).toBeInTheDocument()
    expect(screen.getByText('bar-chart')).toBeInTheDocument()
    expect(screen.getByText('pie-chart')).toBeInTheDocument()
    expect(screen.getByText('data-table')).toBeInTheDocument()
    expect(screen.getByText('share')).toBeInTheDocument()
    expect(screen.getAllByText('capture').length).toBeGreaterThan(0)
  })

  it('switches tabs within a menu without touching global filters', async () => {
    fetchIndicatorDataMock.mockResolvedValue([row()])
    renderApp()
    await screen.findByText('line-chart')

    fireEvent.click(screen.getByRole('button', { name: 'Inflation' }))
    expect(window.location.search).toBe('?tab=inflation')
  })

  it('switching to a different menu section jumps to its first tab', async () => {
    fetchIndicatorDataMock.mockResolvedValue([row()])
    renderApp()
    await screen.findByText('line-chart')

    fireEvent.click(screen.getByRole('button', { name: 'Health' }))
    expect(window.location.pathname + window.location.search).toBe('/health?tab=life-expectancy')
  })

  it('clears the cached layout when "Clear layout" is clicked', async () => {
    fetchIndicatorDataMock.mockResolvedValue([row()])
    renderApp()
    await screen.findByText('line-chart')

    localStorage.setItem('layout.v1', JSON.stringify({ 'NY.GDP.MKTP.CD': { lg: [] } }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear layout' }))
    expect(JSON.parse(localStorage.getItem('layout.v1')!)).toEqual({})
  })

  it('collapses the desktop sidebar to zero width when the nav toggle is clicked (viewport >= 1024px)', async () => {
    fetchIndicatorDataMock.mockResolvedValue([row()])
    const { container } = renderApp()
    await screen.findByText('line-chart')

    const aside = container.querySelector('aside')!
    expect(aside.style.width).toBe('240px')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    expect(aside.style.width).toBe('0px')
  })

  it('opens the mobile nav drawer instead, below the lg breakpoint (<1024px)', async () => {
    vi.stubGlobal('innerWidth', 800)
    fetchIndicatorDataMock.mockResolvedValue([row()])
    const { container } = renderApp()
    await screen.findByText('line-chart')

    const aside = container.querySelector('aside')!
    const overlay = within(aside).getByLabelText('Close navigation')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    expect(overlay).toHaveAttribute('aria-hidden', 'false')
  })
})

import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Layout as AppLayout } from './catalyst-ui/components/Layout/Layout'
import { MenuBar } from './catalyst-ui/components/MenuBar/MenuBar'
import { Row } from './catalyst-ui/components/Grid/Row'
import { Col } from './catalyst-ui/components/Grid/Col'
import { Card } from './catalyst-ui/components/Card/Card'
import { Button } from './catalyst-ui/components/Button/Button'
import { useFilters } from './filters/useFilters'
import { FiltersBar } from './filters/FiltersBar'
import { fetchIndicatorData } from './api/worldBank'
import { IndicatorLineChart } from './charts/IndicatorLineChart'
import { IndicatorBarChart } from './charts/IndicatorBarChart'
import { IndicatorPieChart } from './charts/IndicatorPieChart'
import { DataTable } from './charts/DataTable'
import { ChartCard } from './charts/ChartCard'
import { latestYearRows } from './charts/latestYearRows'
import { isAdditiveIndicator } from './charts/additiveIndicators'
import { buildExportFilename } from './export/exportToExcel'
import { CaptureButton } from './export/CaptureButton'
import { formatFilterSummary } from './export/filterSummary'
import { findTabByIndicator, MENUS } from './navigation/menus'
import { PageChartGrid } from './layout/PageChartGrid'
import { clearLayoutCache } from './layout/gridLayout'

function App() {
  const { values, setFilter } = useFilters(['countries', 'yearRange', 'indicator'] as const)

  // Active menu/tab is derived from the indicator filter, not separate local
  // state — a shared link's ?indicator= then highlights the right tab too.
  const location = findTabByIndicator(values.indicator) ?? { menu: MENUS[0], tab: MENUS[0].tabs[0] }

  const { data, isLoading, error, status, refetch } = useQuery({
    queryKey: ['indicator', values.countries, values.indicator, values.yearRange],
    queryFn: () => fetchIndicatorData(values.countries, values.indicator, values.yearRange),
    // Default networkMode:'online' silently *pauses* the query (no data, no
    // error, no loading) whenever the browser fires an offline event — e.g. a
    // DNS failure — leaving the UI stuck rendering nothing forever. 'always'
    // makes a real network failure surface as a normal error instead.
    networkMode: 'always',
    // Fail fast rather than silently retrying for several seconds — the UI
    // already has an explicit Retry button for the user to act on.
    retry: false,
  })

  const pageRef = useRef<HTMLDivElement>(null)

  const { width: gridWidth, containerRef: gridContainerRef } = useContainerWidth()
  // useContainerWidth's measuring effect runs exactly once, on first mount —
  // if it's attached to a div that only exists after `data` loads (as it did
  // originally), containerRef.current is null on that one run, the
  // ResizeObserver never attaches, and gridWidth is stuck at the library's
  // 1280 fallback forever. Merging it onto pageRef (mounted unconditionally,
  // right from the loading state) gives the effect a real node to measure.
  const pageContainerRef = (node: HTMLDivElement | null) => {
    pageRef.current = node
    gridContainerRef.current = node
  }
  // Bumped to force PageChartGrid to remount (and re-read the now-cleared
  // cache) when "Clear layout" is pressed — the page key itself doesn't
  // change, so a remount has to be triggered some other way.
  const [layoutResetNonce, setLayoutResetNonce] = useState(0)

  const barRows = data ? latestYearRows(data) : []
  const pieRows =
    data && isAdditiveIndicator(values.indicator)
      ? latestYearRows(data).filter((r) => r.value !== null && r.value > 0)
      : []
  const countryNames = data ? [...new Map(data.map((r) => [r.countryCode, r.countryName])).values()] : []
  const indicatorName = data?.[0]?.indicatorName ?? location.tab.label
  const filterSummary = formatFilterSummary(indicatorName, countryNames, values.yearRange)
  const filenameFor = (kind: string, ext: 'xlsx' | 'png' | 'pdf') =>
    buildExportFilename(indicatorName, values.countries, values.yearRange, kind, ext)

  const canCapture = status === 'success' && !!data && data.length > 0

  return (
    <AppLayout>
      <AppLayout.Header>
        <MenuBar>
          <MenuBar.Brand>Analytical Dashboard</MenuBar.Brand>
          <MenuBar.Nav>
            {MENUS.map((menu) => (
              <MenuBar.Link
                key={menu.key}
                active={location.menu.key === menu.key}
                onClick={() => setFilter('indicator', menu.tabs[0].indicatorCode)}
              >
                {menu.label}
              </MenuBar.Link>
            ))}
          </MenuBar.Nav>
        </MenuBar>
      </AppLayout.Header>

      <AppLayout.Content>
        {canCapture && (
          <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
            <CaptureButton
              targetRef={pageRef}
              filename={filenameFor('dashboard', 'pdf')}
              format="pdf"
              label="Capture everything (PDF)"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearLayoutCache(values.indicator)
                setLayoutResetNonce((n) => n + 1)
              }}
            >
              Clear layout
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {location.menu.tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={tab.key === location.tab.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('indicator', tab.indicatorCode)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <FiltersBar values={values} setFilter={setFilter} />

        {/* Vertically centers the chart block in whatever space is left below
            the toolbar — "safe" so tall content (many charts, a long table)
            falls back to starting at the top instead of clipping off-screen. */}
        <div className="flex-1 min-h-0 flex flex-col [justify-content:safe_center]">
        <div ref={pageContainerRef} className="w-full max-w-[1400px] mx-auto">
        {isLoading && (
          <Row gutter={16} className="w-full">
            {[0, 1, 2, 3].map((i) => (
              <Col key={i} span={12} lg={6}>
                <Card loading />
              </Col>
            ))}
          </Row>
        )}

        {!isLoading && error && (
          <Card className="w-full">
            <Card.Body>
              <p className="text-danger font-medium mb-1">
                Couldn't load {location.tab.label.toLowerCase()} data
              </p>
              <p className="text-sm text-text-muted mb-4">{error.message}</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </Card.Body>
          </Card>
        )}

        {!isLoading && !error && data && data.length === 0 && (
          <Card className="w-full">
            <Card.Body>
              <p className="text-text font-medium mb-1">No data for this selection</p>
              <p className="text-sm text-text-muted">
                The World Bank has no {location.tab.label.toLowerCase()} data for{' '}
                {values.countries.join(', ')} in {values.yearRange[0]}–{values.yearRange[1]}. Try a
                different country or year range.
              </p>
            </Card.Body>
          </Card>
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <>
            <p className="text-sm text-text-muted mb-3">{filterSummary}</p>
            <PageChartGrid
              key={`${values.indicator}-${layoutResetNonce}`}
              pageKey={values.indicator}
              width={gridWidth}
            >
              <div key="line">
                <ChartCard
                  title={`${indicatorName} over time`}
                  exportRows={data}
                  exportFilename={filenameFor('line', 'xlsx')}
                  captureFilename={filenameFor('line', 'png')}
                  canCapture={canCapture}
                  filterSummary={filterSummary}
                >
                  <IndicatorLineChart rows={data} indicatorName={indicatorName} />
                </ChartCard>
              </div>
              <div key="bar">
                <ChartCard
                  title={`${indicatorName} by country`}
                  exportRows={barRows}
                  exportFilename={filenameFor('bar', 'xlsx')}
                  captureFilename={filenameFor('bar', 'png')}
                  canCapture={canCapture}
                  filterSummary={filterSummary}
                >
                  <IndicatorBarChart rows={data} indicatorName={indicatorName} />
                </ChartCard>
              </div>
              <div key="pie">
                <ChartCard
                  title="Share of total"
                  exportRows={pieRows}
                  exportFilename={filenameFor('pie', 'xlsx')}
                  captureFilename={filenameFor('pie', 'png')}
                  canCapture={canCapture && pieRows.length > 0}
                  filterSummary={filterSummary}
                >
                  <IndicatorPieChart rows={data} indicatorCode={values.indicator} />
                  <p className="text-sm text-text-muted">
                    Hidden automatically for non-additive indicators (rates, percentages).
                  </p>
                </ChartCard>
              </div>
              <div key="table">
                <ChartCard
                  title="Raw data"
                  exportRows={data}
                  exportFilename={filenameFor('table', 'xlsx')}
                  captureFilename={filenameFor('table', 'png')}
                  canCapture={canCapture}
                  filterSummary={filterSummary}
                >
                  <DataTable rows={data} />
                </ChartCard>
              </div>
            </PageChartGrid>
          </>
        )}
        </div>
        </div>
      </AppLayout.Content>
    </AppLayout>
  )
}

export default App

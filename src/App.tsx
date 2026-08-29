import { useRef, useState } from 'react'
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
import { useIndicatorData } from './hooks/useIndicatorData'
import { IndicatorLineChart } from './charts/IndicatorLineChart'
import { IndicatorBarChart } from './charts/IndicatorBarChart'
import { IndicatorPieChart } from './charts/IndicatorPieChart'
import { DataTable } from './charts/DataTable'
import { latestYearRows } from './charts/latestYearRows'
import { isAdditiveIndicator } from './charts/additiveIndicators'
import { ExportButton } from './export/ExportButton'
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

  const { data, isLoading, error, status, refetch } = useIndicatorData(
    values.countries,
    values.indicator,
    values.yearRange,
  )

  const lineRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const pieRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const { width: gridWidth, containerRef: gridContainerRef } = useContainerWidth()
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
    buildExportFilename(indicatorName, values.countries, values.yearRange, kind).replace(/\.xlsx$/, `.${ext}`)

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

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setFilter('countries', ['IDN', 'SGP', 'MYS'])}>
            IDN, SGP, MYS
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFilter('countries', ['USA', 'CHN', 'JPN'])}>
            USA, CHN, JPN
          </Button>
          {canCapture && (
            <CaptureButton
              targetRef={pageRef}
              filename={filenameFor('dashboard', 'pdf')}
              format="pdf"
              label="Capture everything (PDF)"
            />
          )}
          {canCapture && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => {
                clearLayoutCache(values.indicator)
                setLayoutResetNonce((n) => n + 1)
              }}
            >
              Clear layout
            </Button>
          )}
        </div>

        {isLoading && (
          <Row gutter={16}>
            {[0, 1, 2, 3].map((i) => (
              <Col key={i} span={12} lg={6}>
                <Card loading />
              </Col>
            ))}
          </Row>
        )}

        {!isLoading && error && (
          <Card>
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
          <Card>
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
          <div ref={pageRef} className="max-w-[1400px] mx-auto">
            <p className="text-sm text-text-muted mb-3">{filterSummary}</p>
            <div ref={gridContainerRef}>
              <PageChartGrid
                key={`${values.indicator}-${layoutResetNonce}`}
                pageKey={values.indicator}
                width={gridWidth}
              >
                <div key="line">
                  <Card className="h-full flex flex-col">
                    <Card.Header
                      className="flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing"
                    >
                      <Card.Title>{indicatorName} over time</Card.Title>
                      <div className="flex gap-2">
                        <ExportButton rows={data} filename={filenameFor('line', 'xlsx')} />
                        {canCapture && (
                          <CaptureButton targetRef={lineRef} filename={filenameFor('line', 'png')} format="png" />
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="flex-1 overflow-auto">
                      <div ref={lineRef}>
                        <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                        <IndicatorLineChart rows={data} indicatorName={indicatorName} />
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div key="bar">
                  <Card className="h-full flex flex-col">
                    <Card.Header
                      className="flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing"
                    >
                      <Card.Title>{indicatorName} by country</Card.Title>
                      <div className="flex gap-2">
                        <ExportButton rows={barRows} filename={filenameFor('bar', 'xlsx')} />
                        {canCapture && (
                          <CaptureButton targetRef={barRef} filename={filenameFor('bar', 'png')} format="png" />
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="flex-1 overflow-auto">
                      <div ref={barRef}>
                        <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                        <IndicatorBarChart rows={data} indicatorName={indicatorName} />
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div key="pie">
                  <Card className="h-full flex flex-col">
                    <Card.Header
                      className="flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing"
                    >
                      <Card.Title>Share of total</Card.Title>
                      <div className="flex gap-2">
                        <ExportButton rows={pieRows} filename={filenameFor('pie', 'xlsx')} />
                        {canCapture && pieRows.length > 0 && (
                          <CaptureButton targetRef={pieRef} filename={filenameFor('pie', 'png')} format="png" />
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="flex-1 overflow-auto">
                      <div ref={pieRef}>
                        <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                        <IndicatorPieChart rows={data} indicatorCode={values.indicator} />
                        <p className="text-sm text-text-muted">
                          Hidden automatically for non-additive indicators (rates, percentages).
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div key="table">
                  <Card className="h-full flex flex-col">
                    <Card.Header
                      className="flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing"
                    >
                      <Card.Title>Raw data</Card.Title>
                      <div className="flex gap-2">
                        <ExportButton rows={data} filename={filenameFor('table', 'xlsx')} />
                        {canCapture && (
                          <CaptureButton targetRef={tableRef} filename={filenameFor('table', 'png')} format="png" />
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="flex-1 overflow-auto">
                      <div ref={tableRef}>
                        <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                        <DataTable rows={data} />
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </PageChartGrid>
            </div>
          </div>
        )}
      </AppLayout.Content>
    </AppLayout>
  )
}

export default App

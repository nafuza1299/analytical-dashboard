import { useRef } from 'react'
import { Layout } from './catalyst-ui/components/Layout/Layout'
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
    <Layout>
      <Layout.Header>
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
      </Layout.Header>

      <Layout.Content>
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
        </div>

        {isLoading && <p className="text-text-muted">Loading…</p>}
        {error && <p className="text-danger">Failed to load: {error.message}</p>}
        {data && data.length === 0 && <p className="text-text-muted">No data</p>}

        {data && data.length > 0 && (
          <div ref={pageRef}>
            <p className="text-sm text-text-muted mb-3">{filterSummary}</p>
            <Row gutter={16}>
              <Col span={12} lg={6}>
                <Card>
                  <Card.Header className="flex items-center justify-between">
                    <Card.Title>{indicatorName} over time</Card.Title>
                    <div className="flex gap-2">
                      <ExportButton rows={data} filename={filenameFor('line', 'xlsx')} />
                      {canCapture && (
                        <CaptureButton targetRef={lineRef} filename={filenameFor('line', 'png')} format="png" />
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div ref={lineRef}>
                      <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                      <IndicatorLineChart rows={data} indicatorName={indicatorName} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col span={12} lg={6}>
                <Card>
                  <Card.Header className="flex items-center justify-between">
                    <Card.Title>{indicatorName} by country</Card.Title>
                    <div className="flex gap-2">
                      <ExportButton rows={barRows} filename={filenameFor('bar', 'xlsx')} />
                      {canCapture && (
                        <CaptureButton targetRef={barRef} filename={filenameFor('bar', 'png')} format="png" />
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div ref={barRef}>
                      <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                      <IndicatorBarChart rows={data} indicatorName={indicatorName} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col span={12} lg={6}>
                <Card>
                  <Card.Header className="flex items-center justify-between">
                    <Card.Title>Share of total</Card.Title>
                    <div className="flex gap-2">
                      <ExportButton rows={pieRows} filename={filenameFor('pie', 'xlsx')} />
                      {canCapture && pieRows.length > 0 && (
                        <CaptureButton targetRef={pieRef} filename={filenameFor('pie', 'png')} format="png" />
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div ref={pieRef}>
                      <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                      <IndicatorPieChart rows={data} indicatorCode={values.indicator} />
                      <p className="text-sm text-text-muted">
                        Hidden automatically for non-additive indicators (rates, percentages).
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col span={12} lg={6}>
                <Card>
                  <Card.Header className="flex items-center justify-between">
                    <Card.Title>Raw data</Card.Title>
                    <div className="flex gap-2">
                      <ExportButton rows={data} filename={filenameFor('table', 'xlsx')} />
                      {canCapture && (
                        <CaptureButton targetRef={tableRef} filename={filenameFor('table', 'png')} format="png" />
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div ref={tableRef}>
                      <p className="text-xs text-text-muted mb-2">{filterSummary}</p>
                      <DataTable rows={data} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Layout.Content>
    </Layout>
  )
}

export default App

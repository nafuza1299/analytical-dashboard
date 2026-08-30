import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Layout as AppLayout } from './catalyst-ui/components/Layout/Layout'
import { MenuBar } from './catalyst-ui/components/MenuBar/MenuBar'
import { ThemeToggle } from './catalyst-ui/components/ThemeToggle/ThemeToggle'
import { SideNav } from './catalyst-ui/components/SideNav/SideNav'
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
import { ShareButton } from './export/ShareButton'
import { resolveRoute, MENUS } from './navigation/menus'
import { navigate, useLocationSignal } from './navigation/router'
import { MENU_ICONS } from './navigation/menuIcons'
import { PageChartGrid } from './layout/PageChartGrid'
import { clearLayoutCache } from './layout/gridLayout'

function App() {
  const { values, setFilter } = useFilters(['countries', 'yearRange'] as const)

  // The URL (path = menu, `?tab=` = tab) is the source of truth for
  // navigation — re-render on popstate, then re-derive from window.location.
  useLocationSignal()
  const location = resolveRoute(window.location.pathname, new URLSearchParams(window.location.search).get('tab'))
  const indicatorCode = location.tab.indicatorCode

  // Keeps the address bar canonical — a bare `/`, an unknown path, or a
  // stray query param collapses to the resolved route, so "Share Page"
  // always has a real URL to share.
  useEffect(() => {
    const canonical = `/${location.menu.key}?tab=${location.tab.key}`
    if (window.location.pathname + window.location.search !== canonical) {
      window.history.replaceState(null, '', canonical)
    }
  }, [location.menu.key, location.tab.key])

  const { data, isLoading, error, status, refetch } = useQuery({
    queryKey: ['indicator', values.countries, indicatorCode, values.yearRange],
    queryFn: () => fetchIndicatorData(values.countries, indicatorCode, values.yearRange),
    // The Countries filter can now be cleared down to none (see MultiSelect's
    // "Clear all") — an empty country list would otherwise fire a malformed
    // request to the World Bank API instead of just showing a prompt below.
    enabled: values.countries.length > 0,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  // Toggling the one not in play isn't actually harmless: SideNav's drawer
  // effect locks document.body scroll whenever `open` is true, even while
  // the drawer itself is invisible (lg:hidden) — so flipping mobileNavOpen
  // on desktop silently froze page scroll. Only touch the state that
  // matches the current viewport (1024px = the shared "lg" breakpoint).
  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileNavOpen((o) => !o)
    } else {
      setSidebarCollapsed((c) => !c)
    }
  }

  const barRows = data ? latestYearRows(data) : []
  const pieRows =
    data && isAdditiveIndicator(indicatorCode)
      ? latestYearRows(data).filter((r) => r.value !== null && r.value > 0)
      : []
  const indicatorName = data?.[0]?.indicatorName ?? location.tab.label
  const periodLabel = `${values.yearRange[0]}–${values.yearRange[1]}`
  const filenameFor = (kind: string, ext: 'xlsx' | 'png' | 'pdf') =>
    buildExportFilename(indicatorName, values.countries, values.yearRange, kind, ext)

  const canCapture = status === 'success' && !!data && data.length > 0

  return (
    <AppLayout>
      <AppLayout.Header>
        <MenuBar className="[&>div]:py-2 [&>div]:md:py-2">
          <MenuBar.Brand>
            <button
              type="button"
              aria-label="Toggle navigation"
              className="mr-3 flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={toggleSidebar}
            >
              ☰
            </button>
            Analytical Dashboard
          </MenuBar.Brand>
          <MenuBar.Actions>
            <ThemeToggle />
          </MenuBar.Actions>
        </MenuBar>
      </AppLayout.Header>

      <AppLayout hasSider>
      <AppLayout.Sider
        width={240}
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        breakpoint="lg"
      >
        <SideNav
          items={MENUS.map((menu) => ({ key: menu.key, label: menu.label, icon: MENU_ICONS[menu.key] }))}
          activeKey={location.menu.key}
          onSelect={(key) => {
            const menu = MENUS.find((m) => m.key === key)
            if (menu) navigate(`/${menu.key}?tab=${menu.tabs[0].key}`)
          }}
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          breakpoint="lg"
        />
      </AppLayout.Sider>

      <div className="flex flex-1 min-w-0 flex-col">
      <div className="flex items-end gap-1 overflow-x-auto border-b border-border bg-surface px-3 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {location.menu.tabs.map((tab) => {
          const active = tab.key === location.tab.key
          return (
            <button
              key={tab.key}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(`/${location.menu.key}?tab=${tab.key}`)}
              className={[
                'shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                active
                  ? 'relative -mb-px border border-b-0 border-border bg-bg text-text'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="sticky top-0 z-20 bg-bg pb-4">
      <FiltersBar values={values} setFilter={setFilter} />
      </div>

      <AppLayout.Content>
        {canCapture && (
          <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
            <CaptureButton
              targetRef={pageRef}
              filename={filenameFor('dashboard', 'pdf')}
              format="pdf"
              label="Export as PDF"
            />
            <ShareButton menuKey={location.menu.key} tabKey={location.tab.key} values={values} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearLayoutCache(indicatorCode)
                setLayoutResetNonce((n) => n + 1)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M3 12a9 9 0 1 1 2.64 6.36" />
                <path d="M3 21v-6h6" />
              </svg>
              Clear layout
            </Button>
          </div>
        )}

        {/* Vertically centers the chart block in whatever space is left below
            the toolbar — "safe" so tall content (many charts, a long table)
            falls back to starting at the top instead of clipping off-screen. */}
        <div className="flex-1 min-h-0 flex flex-col [justify-content:safe_center]">
        <div ref={pageContainerRef} className="w-full max-w-[1400px] mx-auto">
        {values.countries.length === 0 && (
          <Card className="w-full">
            <Card.Body>
              <p className="text-text font-medium mb-1">No countries selected</p>
              <p className="text-sm text-text-muted">Pick at least one country from the Filters section above.</p>
            </Card.Body>
          </Card>
        )}

        {values.countries.length > 0 && isLoading && (
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
            <PageChartGrid
              key={`${indicatorCode}-${layoutResetNonce}`}
              pageKey={indicatorCode}
              width={gridWidth}
            >
              <div key="line">
                <ChartCard
                  title={`${indicatorName} over time`}
                  exportRows={data}
                  exportFilename={filenameFor('line', 'xlsx')}
                  captureFilename={filenameFor('line', 'png')}
                  canCapture={canCapture}
                  periodLabel={periodLabel}
                >
                  <IndicatorLineChart rows={data} />
                </ChartCard>
              </div>
              <div key="bar">
                <ChartCard
                  title={`${indicatorName} by country`}
                  exportRows={barRows}
                  exportFilename={filenameFor('bar', 'xlsx')}
                  captureFilename={filenameFor('bar', 'png')}
                  canCapture={canCapture}
                  periodLabel={periodLabel}
                >
                  <IndicatorBarChart rows={data} />
                </ChartCard>
              </div>
              <div key="pie">
                <ChartCard
                  title="Share of total"
                  exportRows={pieRows}
                  exportFilename={filenameFor('pie', 'xlsx')}
                  captureFilename={filenameFor('pie', 'png')}
                  canCapture={canCapture && pieRows.length > 0}
                  periodLabel={periodLabel}
                >
                  <IndicatorPieChart rows={data} indicatorCode={indicatorCode} />
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
                  periodLabel={periodLabel}
                >
                  <DataTable rows={data} />
                </ChartCard>
              </div>
            </PageChartGrid>
        )}
        </div>
        </div>
      </AppLayout.Content>
      </div>
      </AppLayout>
    </AppLayout>
  )
}

export default App

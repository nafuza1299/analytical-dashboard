import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Every test seeds the same two countries / three years so the dashboard is
// deterministic — the app's own default is "all countries, last 5 years".
const COUNTRIES = ['USA', 'IDN']
const YEARS = [2018, 2019, 2020]

function wbResponse(
  indicatorCode: string,
  indicatorName: string,
  opts: { empty?: boolean; years?: number[] } = {},
) {
  if (opts.empty) return [{ page: 1, pages: 1, per_page: 1000, total: 0 }, null]
  const points = COUNTRIES.flatMap((iso, ci) =>
    (opts.years ?? YEARS).map((year, yi) => ({
      indicator: { id: indicatorCode, value: indicatorName },
      country: { id: iso.slice(0, 2), value: iso === 'USA' ? 'United States' : 'Indonesia' },
      countryiso3code: iso,
      date: String(year),
      value: 1000 * (ci + 1) + yi,
    })),
  )
  return [{ page: 1, pages: 1, per_page: 1000, total: points.length }, points]
}

const INDICATOR_NAMES: Record<string, string> = {
  'NY.GDP.MKTP.CD': 'GDP (current US$)',
  'FP.CPI.TOTL.ZG': 'Inflation, consumer prices (annual %)',
  'SP.DYN.LE00.IN': 'Life expectancy at birth, total (years)',
}

type Override = { status?: number; body?: unknown } | undefined

/** Stubs the World Bank API — the handler can override the reply per request. */
async function mockWorldBank(page: Page, handler?: (indicatorCode: string) => Override) {
  await page.route('**/api.worldbank.org/**', async (route) => {
    const url = route.request().url()
    const indicatorCode = /\/indicator\/([^?]+)/.exec(url)?.[1] ?? ''
    const override = handler?.(indicatorCode)
    if (override?.status && override.status >= 400) {
      await route.fulfill({ status: override.status, body: 'boom' })
      return
    }
    // Honour the requested date range, so changing the year filter produces
    // differently-shaped data the way the real API would.
    const range = /date=(\d{4}):(\d{4})/.exec(url)
    const years = range
      ? Array.from({ length: Number(range[2]) - Number(range[1]) + 1 }, (_, i) => Number(range[1]) + i)
      : undefined
    await route.fulfill({
      json:
        override?.body ??
        wbResponse(indicatorCode, INDICATOR_NAMES[indicatorCode] ?? indicatorCode, { years }),
    })
  })
}

async function seedFilters(page: Page, yearRange = '2018:2020') {
  await page.addInitScript(
    ([countries, years]) => {
      localStorage.setItem('filters.v1', JSON.stringify({ countries, yearRange: years }))
    },
    [COUNTRIES.join(','), yearRange] as const,
  )
}

test.beforeEach(async ({ page }) => {
  await seedFilters(page)
})

test('bare / canonicalizes to the first menu/tab and renders the charts', async ({ page }) => {
  await mockWorldBank(page)
  await page.goto('/')

  await expect(page).toHaveURL('/economy?tab=gdp')
  await expect(page.getByText('GDP (current US$) over time')).toBeVisible()
  await expect(page.getByText('GDP (current US$) by country')).toBeVisible()
  await expect(page.getByText('Raw data')).toBeVisible()
  // Table renders one row per seeded country, with the seeded years as columns.
  await expect(page.getByRole('cell', { name: 'United States' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Indonesia' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '2019' })).toBeVisible()
  await expect(page.getByText('2 countries')).toBeVisible()
})

test('switching tabs re-fetches with the new indicator code', async ({ page }) => {
  await mockWorldBank(page)
  await page.goto('/economy?tab=gdp')
  await expect(page.getByText('GDP (current US$) over time')).toBeVisible()

  const request = page.waitForRequest(/indicator\/FP\.CPI\.TOTL\.ZG/)
  await page.getByRole('button', { name: 'Inflation' }).click()
  await request

  await expect(page).toHaveURL('/economy?tab=inflation')
  await expect(page.getByText('Inflation, consumer prices (annual %) over time')).toBeVisible()
})

test('sidebar navigates to another menu and lands on its first tab', async ({ page }) => {
  await mockWorldBank(page)
  await page.goto('/economy?tab=gdp')

  await page.getByRole('navigation').getByRole('button', { name: 'Health' }).click()

  await expect(page).toHaveURL('/health?tab=life-expectancy')
  await expect(page.getByText('Life expectancy at birth, total (years) over time')).toBeVisible()
})

test('applied year range survives navigating to another menu', async ({ page }) => {
  await mockWorldBank(page)
  await page.goto('/economy?tab=gdp')

  await page.getByRole('button', { name: /2018 – 2020/ }).click()
  const panel = page.getByRole('dialog')
  await panel.getByRole('button', { name: '2015', exact: true }).click()
  await panel.getByRole('button', { name: '2017', exact: true }).click()
  await page.getByRole('button', { name: 'Apply' }).click()

  // Wait for the applied range to reach the data, not just the picker — a
  // click landing mid-refetch hits a node React is about to replace.
  await expect(page.getByRole('button', { name: /2015 – 2017/ })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '2015' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '2020' })).toHaveCount(0)

  await page.getByRole('navigation').getByRole('button', { name: 'Health' }).click()
  await expect(page).toHaveURL('/health?tab=life-expectancy')
  await expect(page.getByRole('button', { name: /2015 – 2017/ })).toBeVisible()
})

test('API failure shows the error card, and Retry recovers', async ({ page }) => {
  let fail = true
  await mockWorldBank(page, () => (fail ? { status: 500 } : undefined))
  await page.goto('/economy?tab=gdp')

  await expect(page.getByText("Couldn't load gdp data")).toBeVisible()

  fail = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByText('GDP (current US$) over time')).toBeVisible()
})

test('an indicator with no rows shows the empty state, not a broken chart', async ({ page }) => {
  await mockWorldBank(page, (code) => ({ body: wbResponse(code, code, { empty: true }) }))
  await page.goto('/economy?tab=gdp')

  await expect(page.getByText('No data for this selection')).toBeVisible()
  await expect(page.getByText('Raw data')).toHaveCount(0)
})

test('the loaded dashboard has no detectable WCAG A/AA violations', async ({ page }) => {
  await mockWorldBank(page)
  await page.goto('/economy?tab=gdp')
  await expect(page.getByText('GDP (current US$) over time')).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(results.violations).toEqual([])
})

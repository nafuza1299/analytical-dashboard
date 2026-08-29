/** Canonical row every chart/table in this app renders from. */
export interface DataRow {
  countryCode: string
  countryName: string
  indicatorCode: string
  indicatorName: string
  year: number
  /** World Bank has no data for many country/indicator/year combos. Kept as
   * `null` rather than 0 or omitted, so charts render a gap (not a fake dip)
   * and tables can render an explicit "No data" cell. */
  value: number | null
}

interface WorldBankMeta {
  page: number
  pages: number
  per_page: number
  total: number
}

interface WorldBankDataPoint {
  indicator: { id: string; value: string }
  country: { id: string; value: string }
  countryiso3code: string
  date: string
  value: number | null
}

// The API returns a 2-element [meta, data] tuple, not a plain array — and
// `data` is `null` (not `[]`) when the country/indicator combo has no rows.
type WorldBankResponse = [WorldBankMeta, WorldBankDataPoint[] | null]

const BASE_URL = 'https://api.worldbank.org/v2'

export function normalizeWorldBankResponse(response: WorldBankResponse): DataRow[] {
  const [, data] = response
  if (!data) return []

  return data.map((d) => ({
    countryCode: d.countryiso3code,
    countryName: d.country.value,
    indicatorCode: d.indicator.id,
    indicatorName: d.indicator.value,
    year: Number(d.date),
    value: d.value,
  }))
}

export async function fetchIndicatorData(
  countryCodes: string[],
  indicatorCode: string,
  yearRange: [number, number],
): Promise<DataRow[]> {
  const url =
    `${BASE_URL}/country/${countryCodes.join(';')}/indicator/${indicatorCode}` +
    `?format=json&per_page=1000&date=${yearRange[0]}:${yearRange[1]}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`World Bank API request failed: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as WorldBankResponse
  const [meta] = json
  if (meta.pages > 1) {
    // ponytail: per_page=1000 covers every case this app's filters can produce
    // (few dozen countries x ~60 years); raise per_page or add pagination if that changes.
    console.warn(
      `World Bank response for ${indicatorCode} is paginated (${meta.pages} pages) — data was truncated.`,
    )
  }

  return normalizeWorldBankResponse(json)
}

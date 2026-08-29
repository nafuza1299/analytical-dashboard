export type FilterScope = 'global' | 'page'

export interface FilterDef<T> {
  id: string
  scope: FilterScope
  default: T
  serialize: (value: T) => string
  /** Returns null on anything malformed — callers fall back to cache/default rather than crash. */
  parse: (raw: string) => T | null
}

const COUNTRY_CODE = /^[A-Z]{2,3}$/
const MAX_COUNTRIES = 10

export const countriesFilter: FilterDef<string[]> = {
  id: 'countries',
  scope: 'global',
  default: ['IDN'],
  serialize: (codes) => codes.join(','),
  parse: (raw) => {
    const codes = raw
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)
    if (codes.length === 0 || codes.length > MAX_COUNTRIES) return null
    return codes.every((c) => COUNTRY_CODE.test(c)) ? codes : null
  },
}

const MIN_YEAR = 1960
const currentYear = () => new Date().getFullYear()

export const yearRangeFilter: FilterDef<[number, number]> = {
  id: 'yearRange',
  scope: 'global',
  default: [2015, currentYear()],
  serialize: ([start, end]) => `${start}:${end}`,
  parse: (raw) => {
    const match = /^(\d{4}):(\d{4})$/.exec(raw)
    if (!match) return null
    const start = Number(match[1])
    const end = Number(match[2])
    if (start < MIN_YEAR || end > currentYear() || start > end) return null
    return [start, end]
  },
}

const INDICATOR_CODE = /^[A-Z0-9.]+$/i

export const indicatorFilter: FilterDef<string> = {
  id: 'indicator',
  scope: 'page',
  default: 'NY.GDP.MKTP.CD',
  serialize: (code) => code,
  parse: (raw) => (INDICATOR_CODE.test(raw) ? raw.toUpperCase() : null),
}

export const FILTERS = {
  countries: countriesFilter,
  yearRange: yearRangeFilter,
  indicator: indicatorFilter,
} as const

export type FilterId = keyof typeof FILTERS
export type FilterValues = {
  [K in FilterId]: (typeof FILTERS)[K] extends FilterDef<infer T> ? T : never
}

export const CACHE_KEY = 'filters.v1'

import { FILTERS, type FilterId, type FilterValues } from './registry'

const HASH_PREFIX = '#s='

export function encodeShareToken(values: FilterValues): string {
  const params = new URLSearchParams()
  for (const id of Object.keys(FILTERS) as FilterId[]) {
    params.set(id, FILTERS[id].serialize(values[id] as never))
  }
  return btoa(params.toString())
}

export function decodeShareToken(token: string): Partial<Record<FilterId, string>> | null {
  try {
    const params = new URLSearchParams(atob(token))
    const result: Partial<Record<FilterId, string>> = {}
    for (const id of Object.keys(FILTERS) as FilterId[]) {
      const raw = params.get(id)
      if (raw !== null) result[id] = raw
    }
    return result
  } catch {
    return null
  }
}

export function buildShareUrl(values: FilterValues, includeFilters: boolean): string {
  const base = `${window.location.origin}${window.location.pathname}`
  return includeFilters ? `${base}${HASH_PREFIX}${encodeShareToken(values)}` : base
}

export function readShareToken(): string | null {
  const hash = window.location.hash
  return hash.startsWith(HASH_PREFIX) ? hash.slice(HASH_PREFIX.length) : null
}

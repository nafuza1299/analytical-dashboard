import { FILTERS, type FilterId, type FilterValues } from './registry'

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

export function buildShareUrl(
  menuKey: string,
  tabKey: string,
  values: FilterValues,
  includeFilters: boolean,
): string {
  const params = new URLSearchParams({ tab: tabKey })
  if (includeFilters) params.set('filter', encodeShareToken(values))
  return `${window.location.origin}/${menuKey}?${params.toString()}`
}

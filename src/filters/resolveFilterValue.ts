import type { FilterDef, FilterId } from './registry'

/**
 * Precedence: URL param (if present and valid) > cached value (if this page
 * declares the filter and a cache entry parses) > default. Pure so it's
 * testable without touching the DOM/localStorage.
 */
export function resolveFilterValue<T>(
  filter: FilterDef<T>,
  urlParams: URLSearchParams,
  cached: Partial<Record<FilterId, string>> | null,
  pageFilterIds: readonly FilterId[],
  defaultOverride?: T,
): T {
  const fromUrl = urlParams.get(filter.id)
  if (fromUrl !== null) {
    const parsed = filter.parse(fromUrl)
    if (parsed !== null) return parsed
  }

  if (cached && pageFilterIds.includes(filter.id as FilterId)) {
    const raw = cached[filter.id as FilterId]
    if (raw !== undefined) {
      const parsed = filter.parse(raw)
      if (parsed !== null) return parsed
    }
  }

  return defaultOverride ?? filter.default
}

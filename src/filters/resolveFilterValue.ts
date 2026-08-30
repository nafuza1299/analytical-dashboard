import type { FilterDef, FilterId } from './registry'

/**
 * Precedence: cached value (if this page declares the filter and it parses)
 * > default. Pure so it's testable without touching localStorage.
 */
export function resolveFilterValue<T>(
  filter: FilterDef<T>,
  cached: Partial<Record<FilterId, string>> | null,
  pageFilterIds: readonly FilterId[],
  defaultOverride?: T,
): T {
  if (cached && pageFilterIds.includes(filter.id as FilterId)) {
    const raw = cached[filter.id as FilterId]
    if (raw !== undefined) {
      const parsed = filter.parse(raw)
      if (parsed !== null) return parsed
    }
  }

  return defaultOverride ?? filter.default
}

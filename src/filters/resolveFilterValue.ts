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
    // `cached` comes out of JSON.parse, so its declared `string` values are a
    // promise the runtime doesn't keep — a hand-edited, corrupted or
    // older-schema `filters.v1` can hold a number, array or object here, and
    // every `parse()` assumes a string (`raw.split(...)`), so it would throw
    // and take the whole app down to the ErrorBoundary. Anything that isn't a
    // string is malformed by definition, and falls through to the default.
    if (typeof raw === 'string') {
      const parsed = filter.parse(raw)
      if (parsed !== null) return parsed
    }
  }

  return defaultOverride ?? filter.default
}

import { useMemo, useState } from 'react'
import { CACHE_KEY, FILTERS, type FilterDef, type FilterId, type FilterValues } from './registry'
import { resolveFilterValue } from './resolveFilterValue'
import { decodeShareToken } from './shareLink'

function readCache(): Partial<Record<FilterId, string>> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(id: FilterId, serialized: string) {
  try {
    const cache = readCache() ?? {}
    cache[id] = serialized
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage disabled/full — filter just won't persist across sessions
  }
}

// One-time on load: a shared link's ?filter=<token> seeds the cache with its
// filter values, then just that param is stripped so it doesn't linger in
// the URL — `tab` (and anything else) stays, since that's the real route.
function applyShareTokenOnce() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('filter')
  if (!token) return
  const decoded = decodeShareToken(token)
  if (decoded) {
    for (const [id, raw] of Object.entries(decoded) as [FilterId, string][]) {
      writeCache(id, raw)
    }
  }
  params.delete('filter')
  const query = params.toString()
  window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''))
}

/**
 * Declares which global filters a page opts into (plus any page-scoped ones,
 * e.g. `indicator`) and returns their resolved values. Persisted to
 * localStorage only — filter changes never touch the URL or add params.
 */
export function useFilters<K extends FilterId>(
  pageFilterIds: readonly K[],
  defaultOverrides?: Partial<{ [P in K]: FilterValues[P] }>,
) {
  const [version, setVersion] = useState(() => {
    applyShareTokenOnce()
    return 0
  })

  const values = useMemo(() => {
    const cached = readCache()
    const result = {} as { [P in K]: FilterValues[P] }
    for (const id of pageFilterIds) {
      // TS can't distribute a generic call over a union key inside a loop —
      // each iteration is sound at runtime since `id` narrows FILTERS[id]
      // and defaultOverrides[id] to the same FilterValues[id] together.
      result[id] = resolveFilterValue(
        FILTERS[id] as unknown as FilterDef<FilterValues[K]>,
        cached,
        pageFilterIds,
        defaultOverrides?.[id] as FilterValues[K] | undefined,
      ) as FilterValues[K]
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, pageFilterIds.join(',')])

  const setFilter = <P extends K>(id: P, value: FilterValues[P]) => {
    writeCache(id, FILTERS[id].serialize(value as never))
    setVersion((v) => v + 1)
  }

  return { values, setFilter }
}

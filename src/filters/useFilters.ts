import { useEffect, useMemo, useState } from 'react'
import { CACHE_KEY, FILTERS, type FilterId, type FilterValues } from './registry'
import { resolveFilterValue } from './resolveFilterValue'

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

function useUrlSearch() {
  const [search, setSearch] = useState(() => window.location.search)
  useEffect(() => {
    const onPopState = () => setSearch(window.location.search)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  return [search, setSearch] as const
}

/**
 * Declares which global filters a page opts into (plus any page-scoped ones,
 * e.g. `indicator`) and returns their resolved values kept in sync with the
 * URL — the source of truth — so state survives refresh and the back button.
 */
export function useFilters<K extends FilterId>(
  pageFilterIds: readonly K[],
  defaultOverrides?: Partial<{ [P in K]: FilterValues[P] }>,
) {
  const [search, setSearch] = useUrlSearch()

  const values = useMemo(() => {
    const urlParams = new URLSearchParams(search)
    const cached = readCache()
    const result = {} as { [P in K]: FilterValues[P] }
    for (const id of pageFilterIds) {
      result[id] = resolveFilterValue(
        FILTERS[id],
        urlParams,
        cached,
        pageFilterIds,
        defaultOverrides?.[id],
      ) as FilterValues[K]
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pageFilterIds.join(',')])

  // Keep the URL a complete snapshot of resolved state (incl. cached/default
  // values), so it's always a valid, shareable link — not just once touched.
  useEffect(() => {
    const urlParams = new URLSearchParams(search)
    let changed = false
    for (const id of pageFilterIds) {
      const serialized = FILTERS[id].serialize(values[id] as never)
      if (urlParams.get(id) !== serialized) {
        urlParams.set(id, serialized)
        changed = true
      }
    }
    if (changed) {
      window.history.replaceState(null, '', `${window.location.pathname}?${urlParams}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, search])

  const setFilter = <P extends K>(id: P, value: FilterValues[P]) => {
    const urlParams = new URLSearchParams(window.location.search)
    const serialized = FILTERS[id].serialize(value as never)
    urlParams.set(id, serialized)
    window.history.pushState(null, '', `${window.location.pathname}?${urlParams}`)
    setSearch(`?${urlParams}`)

    if (FILTERS[id].scope === 'global') {
      writeCache(id, serialized)
    }
  }

  return { values, setFilter }
}

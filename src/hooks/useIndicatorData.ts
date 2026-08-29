import { useQuery } from '@tanstack/react-query'
import { fetchIndicatorData } from '../api/worldBank'

export function useIndicatorData(
  countries: string[],
  indicatorCode: string,
  yearRange: [number, number],
) {
  return useQuery({
    queryKey: ['indicator', countries, indicatorCode, yearRange],
    queryFn: () => fetchIndicatorData(countries, indicatorCode, yearRange),
    // Default networkMode:'online' silently *pauses* the query (no data, no
    // error, no loading) whenever the browser fires an offline event — e.g. a
    // DNS failure — leaving the UI stuck rendering nothing forever. 'always'
    // makes a real network failure surface as a normal error instead.
    networkMode: 'always',
    // Fail fast rather than silently retrying for several seconds — the UI
    // already has an explicit Retry button for the user to act on.
    retry: false,
  })
}

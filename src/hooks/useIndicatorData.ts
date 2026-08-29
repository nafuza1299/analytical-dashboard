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
  })
}

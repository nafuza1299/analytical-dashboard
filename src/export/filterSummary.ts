/** Rendered into every captured image/PDF — an exported chart with no context is useless. */
export function formatFilterSummary(
  indicatorName: string,
  countryNames: string[],
  yearRange: [number, number],
): string {
  return `${indicatorName} · ${countryNames.join(', ')} · ${yearRange[0]}–${yearRange[1]}`
}

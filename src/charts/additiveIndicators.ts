// A share-of-total pie only makes sense for indicators that are meaningfully
// summable across countries (absolute counts/amounts). Rates, percentages,
// and per-capita figures are not additive — summing them is meaningless — so
// the pie chart must stay hidden for those. The World Bank API doesn't flag
// this itself, so it's a maintained allowlist rather than derived.
const ADDITIVE_INDICATOR_CODES = new Set([
  'NY.GDP.MKTP.CD', // GDP (current US$)
  'SP.POP.TOTL', // Population, total
  'EN.GHG.CO2.MT.CE.AR5', // CO2 emissions (Mt CO2e)
  'AG.LND.FRST.K2', // Forest area (sq. km)
])

export function isAdditiveIndicator(indicatorCode: string): boolean {
  return ADDITIVE_INDICATOR_CODES.has(indicatorCode)
}

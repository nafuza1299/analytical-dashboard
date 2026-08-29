/** Curated set of commonly-analyzed World Bank economies (ISO-3 codes). */
export interface CountryOption {
  code: string
  name: string
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'USA', name: 'United States' },
  { code: 'CHN', name: 'China' },
  { code: 'JPN', name: 'Japan' },
  { code: 'DEU', name: 'Germany' },
  { code: 'IND', name: 'India' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'FRA', name: 'France' },
  { code: 'ITA', name: 'Italy' },
  { code: 'CAN', name: 'Canada' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'RUS', name: 'Russia' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'AUS', name: 'Australia' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'IDN', name: 'Indonesia' },
  { code: 'SAU', name: 'Saudi Arabia' },
  { code: 'TUR', name: 'Turkey' },
  { code: 'ZAF', name: 'South Africa' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'SGP', name: 'Singapore' },
  { code: 'MYS', name: 'Malaysia' },
  { code: 'THA', name: 'Thailand' },
  { code: 'VNM', name: 'Vietnam' },
  { code: 'PHL', name: 'Philippines' },
  { code: 'NLD', name: 'Netherlands' },
  { code: 'CHE', name: 'Switzerland' },
  { code: 'ESP', name: 'Spain' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'POL', name: 'Poland' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'NOR', name: 'Norway' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'NGA', name: 'Nigeria' },
  { code: 'PAK', name: 'Pakistan' },
  { code: 'BGD', name: 'Bangladesh' },
  { code: 'ARE', name: 'United Arab Emirates' },
  { code: 'ISR', name: 'Israel' },
  { code: 'NZL', name: 'New Zealand' },
  { code: 'CHL', name: 'Chile' },
  { code: 'COL', name: 'Colombia' },
]

export const COUNTRY_CODES = COUNTRY_OPTIONS.map((c) => c.code)

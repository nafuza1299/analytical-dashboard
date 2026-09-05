import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchIndicatorData, normalizeWorldBankResponse } from './worldBank'

describe('normalizeWorldBankResponse', () => {
  it('maps data points to the canonical row shape', () => {
    const rows = normalizeWorldBankResponse([
      { page: 1, pages: 1, per_page: 1000, total: 1 },
      [
        {
          indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' },
          country: { id: 'ID', value: 'Indonesia' },
          countryiso3code: 'IDN',
          date: '2023',
          value: 1371171725450.71,
        },
      ],
    ])

    expect(rows).toEqual([
      {
        countryCode: 'IDN',
        countryName: 'Indonesia',
        indicatorCode: 'NY.GDP.MKTP.CD',
        indicatorName: 'GDP (current US$)',
        year: 2023,
        value: 1371171725450.71,
      },
    ])
  })

  it('keeps null values as null instead of dropping or zeroing them', () => {
    const rows = normalizeWorldBankResponse([
      { page: 1, pages: 1, per_page: 1000, total: 1 },
      [
        {
          indicator: { id: 'SP.DYN.LE00.IN', value: 'Life expectancy at birth' },
          country: { id: 'KP', value: 'Korea, Dem. People\'s Rep.' },
          countryiso3code: 'PRK',
          date: '2023',
          value: null,
        },
      ],
    ])

    expect(rows[0].value).toBeNull()
  })

  it('returns an empty array when the API finds no matching data', () => {
    const rows = normalizeWorldBankResponse([{ page: 1, pages: 1, per_page: 1000, total: 0 }, null])
    expect(rows).toEqual([])
  })
})

describe('fetchIndicatorData', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('builds the request URL and normalizes the response', async () => {
    const payload: [unknown, unknown] = [
      { page: 1, pages: 1, per_page: 1000, total: 1 },
      [
        {
          indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' },
          country: { id: 'ID', value: 'Indonesia' },
          countryiso3code: 'IDN',
          date: '2023',
          value: 100,
        },
      ],
    ]
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchIndicatorData(['IDN'], 'NY.GDP.MKTP.CD', [2020, 2023])

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/country/IDN/indicator/NY.GDP.MKTP.CD?format=json&per_page=1000&date=2020:2023'),
    )
    expect(rows).toEqual([
      { countryCode: 'IDN', countryName: 'Indonesia', indicatorCode: 'NY.GDP.MKTP.CD', indicatorName: 'GDP (current US$)', year: 2023, value: 100 },
    ])
  })

  it('joins multiple country codes with a semicolon', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ page: 1, pages: 1, per_page: 1000, total: 0 }, null],
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchIndicatorData(['IDN', 'SGP'], 'NY.GDP.MKTP.CD', [2020, 2023])

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/country/IDN;SGP/indicator/'))
  })

  it('throws with the status text when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' }))
    await expect(fetchIndicatorData(['IDN'], 'NY.GDP.MKTP.CD', [2020, 2023])).rejects.toThrow(
      'World Bank API request failed: 500 Server Error',
    )
  })

  it('warns but still returns data when the response is paginated', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ page: 1, pages: 2, per_page: 1000, total: 2000 }, []],
    }))

    const rows = await fetchIndicatorData(['IDN'], 'NY.GDP.MKTP.CD', [2020, 2023])

    expect(rows).toEqual([])
    expect(warnSpy).toHaveBeenCalledOnce()
    warnSpy.mockRestore()
  })
})

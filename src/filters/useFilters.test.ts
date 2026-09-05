import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CACHE_KEY } from './registry'
import { encodeShareToken } from './shareLink'
import { useFilters } from './useFilters'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})

describe('useFilters', () => {
  it('defaults to the filter registry default when nothing is cached', () => {
    const { result } = renderHook(() => useFilters(['yearRange'] as const))
    expect(result.current.values.yearRange).toEqual(expect.any(Array))
  })

  it('applies a defaultOverride when nothing is cached', () => {
    const { result } = renderHook(() => useFilters(['countries'] as const, { countries: ['IDN'] }))
    expect(result.current.values.countries).toEqual(['IDN'])
  })

  it('persists a set filter to localStorage and reflects it in values', () => {
    const { result } = renderHook(() => useFilters(['countries'] as const))
    act(() => result.current.setFilter('countries', ['USA', 'CHN']))
    expect(result.current.values.countries).toEqual(['USA', 'CHN'])
    expect(JSON.parse(localStorage.getItem(CACHE_KEY)!).countries).toBe('USA,CHN')
  })

  it('falls back to default when the cache holds malformed JSON', () => {
    localStorage.setItem(CACHE_KEY, '{not json')
    const { result } = renderHook(() => useFilters(['countries'] as const))
    expect(result.current.values.countries.length).toBeGreaterThan(0)
  })

  it('does not throw when localStorage.setItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    const { result } = renderHook(() => useFilters(['countries'] as const))
    expect(() => act(() => result.current.setFilter('countries', ['USA']))).not.toThrow()
    spy.mockRestore()
  })

  it('seeds the cache from a ?filter= share token and strips it from the URL', () => {
    const token = encodeShareToken({ countries: ['VNM'], yearRange: [2010, 2020] })
    window.history.replaceState(null, '', `/economy?tab=gdp&filter=${token}`)

    const { result } = renderHook(() => useFilters(['countries', 'yearRange'] as const))

    expect(result.current.values.countries).toEqual(['VNM'])
    expect(result.current.values.yearRange).toEqual([2010, 2020])
    expect(window.location.search).toBe('?tab=gdp')
  })

  it('leaves the URL alone when there is no share token', () => {
    window.history.replaceState(null, '', '/economy?tab=gdp')
    renderHook(() => useFilters(['countries'] as const))
    expect(window.location.search).toBe('?tab=gdp')
  })
})

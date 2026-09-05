import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { navigate, useLocationSignal } from './router'

describe('navigate / useLocationSignal', () => {
  it('pushes the new path and re-renders subscribers with it', () => {
    const { result } = renderHook(() => useLocationSignal())
    act(() => navigate('/health?tab=mortality'))
    expect(result.current).toBe('/health?tab=mortality')
    expect(window.location.pathname).toBe('/health')
  })
})

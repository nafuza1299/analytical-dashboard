import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => cleanup())

// jsdom implements neither: components that measure themselves
// (ResponsiveContainer, YearRangePicker's reposition effect) need them to exist.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

// jsdom never lays anything out, so every element reports a zero-size rect —
// recharts' ResponsiveContainer (and YearRangePicker's popover positioning)
// need a non-zero one to render/position anything at all.
// jsdom never lays anything out, so every element reports a zero-size rect.
// recharts' ResponsiveContainer wrapper div needs a real one to render a
// chart at all; everything else (e.g. recharts' own hidden span it uses to
// measure axis tick labels) just needs *some* non-zero, realistic size —
// handing every element the container's full 800x400 makes axis layout
// math blow up and collapse the plot area to zero width instead.
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: function (this: HTMLElement) {
    const isChartContainer = this.classList.contains('recharts-responsive-container')
    const width = isChartContainer ? 800 : 60
    const height = isChartContainer ? 400 : 20
    return { width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON() {} }
  },
})

// jsdom has no layout engine, so it doesn't implement SVGElement.getBBox at
// all — recharts uses it to measure axis tick labels, and silently collapses
// the whole plot area to zero width/height when it throws.
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  configurable: true,
  value: () => ({ x: 0, y: 0, width: 50, height: 20 }),
})

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })),
)

if (!navigator.clipboard) {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
}

if (!URL.createObjectURL) {
  Object.assign(URL, { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() })
}

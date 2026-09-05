import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FiltersBar } from './FiltersBar'
import type { FilterValues } from './registry'

vi.mock('../catalyst-ui/components/MultiSelect/MultiSelect', () => ({
  MultiSelect: ({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) => (
    <button onClick={() => onChange([...value, 'NEW'])}>edit-countries</button>
  ),
}))
vi.mock('../catalyst-ui/components/YearRangePicker/YearRangePicker', () => ({
  YearRangePicker: () => <div>year-range-picker</div>,
}))

function renderBar(values: Pick<FilterValues, 'countries' | 'yearRange'>, setFilter = vi.fn()) {
  return { setFilter, ...render(<FiltersBar values={values} setFilter={setFilter} />) }
}

describe('FiltersBar', () => {
  it('collapses and re-expands the filter controls', () => {
    renderBar({ countries: ['IDN'], yearRange: [2015, 2024] })
    expect(screen.getByText('edit-countries')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /Filters/ }))
    expect(screen.queryByText('edit-countries')).not.toBeInTheDocument()
    expect(screen.getByText(/1 countries/)).toBeInTheDocument()
  })

  it('keeps Apply disabled until a draft edit diverges from the applied values', () => {
    renderBar({ countries: ['IDN'], yearRange: [2015, 2024] })
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    fireEvent.click(screen.getByText('edit-countries'))
    expect(screen.getByRole('button', { name: 'Apply' })).not.toBeDisabled()
  })

  it('only commits the draft to setFilter when Apply is clicked', () => {
    const { setFilter } = renderBar({ countries: ['IDN'], yearRange: [2015, 2024] })
    fireEvent.click(screen.getByText('edit-countries'))
    expect(setFilter).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(setFilter).toHaveBeenCalledWith('countries', ['IDN', 'NEW'])
    expect(setFilter).toHaveBeenCalledWith('yearRange', [2015, 2024])
  })

  it('resyncs the draft when the applied values change externally', () => {
    const { rerender } = render(
      <FiltersBar values={{ countries: ['IDN'], yearRange: [2015, 2024] }} setFilter={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('edit-countries'))
    expect(screen.getByRole('button', { name: 'Apply' })).not.toBeDisabled()

    rerender(<FiltersBar values={{ countries: ['IDN', 'NEW'], yearRange: [2015, 2024] }} setFilter={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
  })
})

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ShareButton } from './ShareButton'
import type { FilterValues } from '../filters/registry'

const values: FilterValues = { countries: ['IDN'], yearRange: [2015, 2024] }

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('ShareButton', () => {
  it('opens the modal with a URL that includes the filter token by default', () => {
    render(<ShareButton menuKey="economy" tabKey="gdp" values={values} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share Page' }))
    const input = screen.getByDisplayValue(/tab=gdp/) as HTMLInputElement
    expect(input.value).toContain('filter=')
  })

  it('drops the filter token when "Without filter settings" is selected', () => {
    render(<ShareButton menuKey="economy" tabKey="gdp" values={values} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share Page' }))
    fireEvent.click(screen.getByLabelText('Without filter settings'))
    const input = screen.getByDisplayValue(/tab=gdp/) as HTMLInputElement
    expect(input.value).not.toContain('filter=')
  })

  it('copies the URL and reverts the label after 2 seconds', async () => {
    render(<ShareButton menuKey="economy" tabKey="gdp" values={values} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share Page' }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
      await Promise.resolve()
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('closes the modal from the footer Close button', () => {
    render(<ShareButton menuKey="economy" tabKey="gdp" values={values} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share Page' }))
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[closeButtons.length - 1])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

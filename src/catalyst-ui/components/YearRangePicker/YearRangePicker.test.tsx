import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YearRangePicker } from './YearRangePicker'

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /2000.*2005/ }))
}

describe('YearRangePicker Component', () => {
  it('does not commit after only the first year is clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<YearRangePicker label="Year range" value={[2000, 2005]} onChange={onChange} min={1998} max={2010} />)

    await openPanel(user)
    await user.click(screen.getByRole('button', { name: '2003' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits [start, end] once a later year is clicked and closes the panel', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<YearRangePicker label="Year range" value={[2000, 2005]} onChange={onChange} min={1998} max={2010} />)

    await openPanel(user)
    await user.click(screen.getByRole('button', { name: '2003' }))
    await user.click(screen.getByRole('button', { name: '2007' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([2003, 2007])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('swaps the order when the second click is an earlier year', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<YearRangePicker label="Year range" value={[2000, 2005]} onChange={onChange} min={1998} max={2010} />)

    await openPanel(user)
    await user.click(screen.getByRole('button', { name: '2003' }))
    await user.click(screen.getByRole('button', { name: '1999' }))

    expect(onChange).toHaveBeenCalledWith([1999, 2003])
  })

  it('discards the in-progress pick on Escape without calling onChange', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<YearRangePicker label="Year range" value={[2000, 2005]} onChange={onChange} min={1998} max={2010} />)

    await openPanel(user)
    await user.click(screen.getByRole('button', { name: '2003' }))
    await user.keyboard('{Escape}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('discards the in-progress pick on outside click without calling onChange', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<YearRangePicker label="Year range" value={[2000, 2005]} onChange={onChange} min={1998} max={2010} />)

    await openPanel(user)
    await user.click(screen.getByRole('button', { name: '2003' }))
    fireEvent.mouseDown(document.body)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

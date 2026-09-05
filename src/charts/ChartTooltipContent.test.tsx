import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ComponentProps } from 'react'
import { ChartTooltipContent } from './ChartTooltipContent'

type Props = ComponentProps<typeof ChartTooltipContent>

const stub = {} as Props

const payload = [
  { name: 'Indonesia', value: 1234.5, color: '#123456' },
  { name: 'Singapore', value: 987.6, color: '#654321' },
] as unknown as Props['payload']

describe('ChartTooltipContent', () => {
  it('renders nothing when inactive', () => {
    const { container } = render(<ChartTooltipContent {...stub} active={false} payload={payload} label={2023} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when there is no payload', () => {
    const { container } = render(
      <ChartTooltipContent {...stub} active payload={[] as unknown as Props['payload']} label={2023} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the label and each series with a color swatch', () => {
    render(<ChartTooltipContent {...stub} active payload={payload} label={2023} />)
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText(/Indonesia : 1.234,5/)).toBeInTheDocument()
  })

  it('prefixes with $ and appends the suffix when given', () => {
    render(<ChartTooltipContent {...stub} active payload={payload} label={2023} isCurrency suffix=" yrs" />)
    expect(screen.getByText('Indonesia : $1.234,5 yrs')).toBeInTheDocument()
  })
})

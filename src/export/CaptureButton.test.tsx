import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CaptureButton } from './CaptureButton'

const { pngMock, pdfMock } = vi.hoisted(() => ({
  pngMock: vi.fn().mockResolvedValue(undefined),
  pdfMock: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('./captureImage', () => ({ captureElementToPng: pngMock, captureElementToPdf: pdfMock }))

function Harness(props: { format: 'png' | 'pdf'; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref}>
      <CaptureButton targetRef={ref} filename="chart.png" format={props.format} label={props.label} />
    </div>
  )
}

describe('CaptureButton', () => {
  it('captures to PNG when format is png', async () => {
    render(<Harness format="png" label="Capture" />)
    fireEvent.click(screen.getByRole('button', { name: 'Capture' }))
    expect(pngMock).toHaveBeenCalled()
    expect(pdfMock).not.toHaveBeenCalled()
  })

  it('captures to PDF when format is pdf', async () => {
    render(<Harness format="pdf" label="Export" />)
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    expect(pdfMock).toHaveBeenCalled()
  })

  it('renders icon-only with a default aria-label when no label is given', () => {
    render(<Harness format="png" />)
    expect(screen.getByRole('button', { name: 'Capture PNG' })).toBeInTheDocument()
  })

  it('does nothing if the target ref has no current element', () => {
    function NullRefHarness() {
      const ref = useRef<HTMLDivElement>(null)
      return <CaptureButton targetRef={ref} filename="x.png" format="png" label="Capture" />
    }
    render(<NullRefHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Capture' }))
    expect(pngMock).not.toHaveBeenCalled()
  })
})

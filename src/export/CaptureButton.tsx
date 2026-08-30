import { useState, type RefObject } from 'react'
import { Button } from '../catalyst-ui/components/Button/Button'
import { captureElementToPdf, captureElementToPng } from './captureImage'

interface Props {
  targetRef: RefObject<HTMLElement | null>
  filename: string
  format: 'png' | 'pdf'
  label?: string
}

const icons = {
  pdf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 18v-7M9 14l3 3 3-3" />
    </svg>
  ),
  png: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
}

export function CaptureButton({ targetRef, filename, format, label }: Props) {
  const [capturing, setCapturing] = useState(false)

  const handleClick = async () => {
    if (!targetRef.current) return
    setCapturing(true)
    try {
      if (format === 'png') {
        await captureElementToPng(targetRef.current, filename)
      } else {
        await captureElementToPdf(targetRef.current, filename)
      }
    } finally {
      setCapturing(false)
    }
  }

  const defaultLabel = format === 'png' ? 'Capture PNG' : 'Export as PDF'

  if (!label) {
    return (
      <Button variant="ghost" size="sm" iconOnly loading={capturing} aria-label={defaultLabel} onClick={handleClick}>
        {icons[format]}
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" loading={capturing} onClick={handleClick}>
      {icons[format]}
      {label}
    </Button>
  )
}

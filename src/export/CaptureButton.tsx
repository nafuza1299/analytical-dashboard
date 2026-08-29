import { useState, type RefObject } from 'react'
import { Button } from '../catalyst-ui/components/Button/Button'
import { captureElementToPdf, captureElementToPng } from './captureImage'

interface Props {
  targetRef: RefObject<HTMLElement | null>
  filename: string
  format: 'png' | 'pdf'
  label?: string
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

  return (
    <Button variant="ghost" size="sm" loading={capturing} onClick={handleClick}>
      {label ?? (format === 'png' ? 'Capture PNG' : 'Capture PDF')}
    </Button>
  )
}

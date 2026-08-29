import { useRef, type ReactNode } from 'react'
import { Card } from '../catalyst-ui/components/Card/Card'
import { ExportButton } from '../export/ExportButton'
import { CaptureButton } from '../export/CaptureButton'
import type { DataRow } from '../api/worldBank'

interface Props {
  title: string
  periodLabel: string
  exportRows: DataRow[]
  exportFilename: string
  captureFilename: string
  canCapture: boolean
  children: ReactNode
}

/** The header/export/capture chrome shared by every chart card in the grid. */
export function ChartCard({
  title,
  periodLabel,
  exportRows,
  exportFilename,
  captureFilename,
  canCapture,
  children,
}: Props) {
  const captureRef = useRef<HTMLDivElement>(null)

  return (
    <Card className="h-full flex flex-col">
      <Card.Header className="flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing">
        <hgroup>
          <Card.Title>{title}</Card.Title>
          <p className="text-xs text-text-muted">{periodLabel}</p>
        </hgroup>
        <div className="flex gap-2">
          <ExportButton rows={exportRows} filename={exportFilename} />
          {canCapture && <CaptureButton targetRef={captureRef} filename={captureFilename} format="png" />}
        </div>
      </Card.Header>
      <Card.Body className="flex-1 overflow-auto">
        <div ref={captureRef} className="h-full">
          {children}
        </div>
      </Card.Body>
    </Card>
  )
}

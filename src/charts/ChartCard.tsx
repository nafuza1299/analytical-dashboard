import { useRef, type ReactNode } from 'react'
import { Card } from '../catalyst-ui/components/Card/Card'
import { Button } from '../catalyst-ui/components/Button/Button'
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
  hasInteractiveLegend?: boolean
  children: ReactNode
}

const LEGEND_HELP_TEXT =
  'Click a legend item to isolate it (click again to reset). Shift+click to select multiple. Ctrl/Cmd+click to hide it.'

/** The header/export/capture chrome shared by every chart card in the grid. */
export function ChartCard({
  title,
  periodLabel,
  exportRows,
  exportFilename,
  captureFilename,
  canCapture,
  hasInteractiveLegend,
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
        <div className="flex items-center gap-2">
          {hasInteractiveLegend && (
            <Button variant="ghost" size="sm" iconOnly aria-label={LEGEND_HELP_TEXT} title={LEGEND_HELP_TEXT} className="cursor-help">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="10.5" x2="12" y2="16" />
                <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </Button>
          )}
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

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../Button/Button'

export interface YearRangePickerProps {
  label: string
  value: [number, number]
  onChange: (next: [number, number]) => void
  min: number
  max: number
}

type CellState = 'endpoint' | 'in-range' | 'default'

const cellClass: Record<CellState, string> = {
  default: 'text-text hover:bg-surface-hover',
  'in-range': 'bg-primary/10 text-text',
  endpoint: 'bg-primary text-primary-fg font-medium',
}

export function YearRangePicker({ label, value, onChange, min, max }: YearRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingStart, setPendingStart] = useState<number | null>(null)
  const [hoverYear, setHoverYear] = useState<number | null>(null)
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Portalled to <body> (see below) so the popover isn't clipped by an
  // ancestor's overflow-hidden (e.g. the Filters Card) — position is tracked
  // in viewport coordinates instead of relying on CSS anchoring.
  useLayoutEffect(() => {
    if (!isOpen) return
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) setPanelPos({ top: rect.bottom + 4, left: rect.left })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const years = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max])

  const closePanel = () => {
    setIsOpen(false)
    setPendingStart(null)
    setHoverYear(null)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      closePanel()
      triggerRef.current?.focus()
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !panelRef.current?.contains(e.target as Node)) {
        closePanel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleYearClick = (year: number) => {
    if (pendingStart === null) {
      setPendingStart(year)
      return
    }
    const next: [number, number] = year >= pendingStart ? [pendingStart, year] : [year, pendingStart]
    onChange(next)
    closePanel()
  }

  const cellState = (year: number): CellState => {
    const [lo, hi] =
      pendingStart !== null
        ? [Math.min(pendingStart, hoverYear ?? pendingStart), Math.max(pendingStart, hoverYear ?? pendingStart)]
        : value
    if (year === lo || year === hi) return 'endpoint'
    if (year > lo && year < hi) return 'in-range'
    return 'default'
  }

  const thisYear = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="relative inline-block">
        <Button
          ref={triggerRef}
          type="button"
          variant="secondary"
          size="md"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => (isOpen ? closePanel() : setIsOpen(true))}
        >
          {value[0]} – {value[1]}
          <span aria-hidden="true" className="text-xs">
            ▾
          </span>
        </Button>

        {isOpen &&
          createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={`${label} year picker`}
              style={{ top: panelPos.top, left: panelPos.left }}
              className="fixed w-72 p-2 bg-surface border border-border rounded-lg shadow-elevation z-50"
            >
              <div
                className="grid grid-cols-6 gap-1 max-h-80 overflow-y-auto"
                onMouseLeave={() => setHoverYear(null)}
              >
                {years.map((year) => {
                  const state = cellState(year)
                  return (
                    <button
                      key={year}
                      type="button"
                      aria-pressed={state === 'endpoint'}
                      onMouseEnter={() => setHoverYear(year)}
                      onClick={() => handleYearClick(year)}
                      className={[
                        'h-9 rounded-md text-sm transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        cellClass[state],
                        year === thisYear && state === 'default'
                          ? 'underline decoration-dotted decoration-text-muted underline-offset-4'
                          : '',
                      ].join(' ')}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  )
}

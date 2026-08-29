import { useEffect, useMemo, useRef, useState } from 'react'
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

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

        {isOpen && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label={`${label} year picker`}
            className="absolute top-full left-0 mt-1 w-72 p-2 bg-surface border border-border rounded-lg shadow-elevation z-50"
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
          </div>
        )}
      </div>
    </div>
  )
}

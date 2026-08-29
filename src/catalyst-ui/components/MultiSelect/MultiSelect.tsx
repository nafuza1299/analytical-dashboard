import { useEffect, useId, useRef, useState } from 'react'
import { Tag } from '../Tag/Tag'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  /** Trigger label prefix, e.g. "Countries". */
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  /** Selection stops accepting new checks once reached. */
  max?: number
  /** Last remaining checked item can't be unchecked below this. Defaults to 1. */
  min?: number
}

const triggerClass =
  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-border bg-surface text-text hover:bg-surface-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export function MultiSelect({ label, options, value, onChange, max, min = 1 }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggle = (code: string) => {
    const checked = value.includes(code)
    if (checked) {
      if (value.length <= min) return
      onChange(value.filter((v) => v !== code))
    } else {
      if (max !== undefined && value.length >= max) return
      onChange([...value, code])
    }
  }

  const visibleOptions = options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="flex flex-col gap-2">
      <div className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen((o) => !o)}
          className={triggerClass}
        >
          {label} ({value.length})
          <span aria-hidden="true" className="text-xs">
            ▾
          </span>
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            id={menuId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            className="absolute top-full left-0 mt-1 w-64 max-h-80 flex flex-col bg-surface border border-border rounded-lg shadow-elevation z-50"
          >
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
                className="w-full px-2 py-1 text-sm rounded-md border border-border bg-bg text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="overflow-y-auto py-1">
              {visibleOptions.map((option) => {
                const checked = value.includes(option.value)
                const disabled = checked
                  ? value.length <= min
                  : max !== undefined && value.length >= max
                return (
                  <label
                    key={option.value}
                    className={[
                      'flex items-center gap-2 px-3 py-1.5 text-sm text-text',
                      disabled ? 'opacity-50' : 'hover:bg-surface-hover cursor-pointer',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
              {visibleOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-text-muted">No matches</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options
          .filter((o) => value.includes(o.value))
          .map((option) => (
            <Tag key={option.value} size="sm" dismissible onDismiss={() => toggle(option.value)}>
              {option.label}
            </Tag>
          ))}
      </div>
    </div>
  )
}

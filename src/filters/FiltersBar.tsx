import { useEffect, useRef, useState } from 'react'
import { Card } from '../catalyst-ui/components/Card/Card'
import { Button } from '../catalyst-ui/components/Button/Button'
import { MultiSelect } from '../catalyst-ui/components/MultiSelect/MultiSelect'
import { COUNTRY_OPTIONS } from '../data/countries'
import { MAX_COUNTRIES, MIN_YEAR } from './registry'
import type { FilterValues } from './registry'

const selectClass =
  'px-3 py-2 text-sm rounded-md border border-border bg-surface text-text hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

const currentYear = () => new Date().getFullYear()
const YEARS = Array.from({ length: currentYear() - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

type AppliedValues = Pick<FilterValues, 'countries' | 'yearRange'>

export interface FiltersBarProps {
  values: AppliedValues
  setFilter: <K extends 'countries' | 'yearRange'>(id: K, value: FilterValues[K]) => void
}

export function FiltersBar({ values, setFilter }: FiltersBarProps) {
  // Edits go into `draft` and only reach `setFilter` (and therefore the
  // chart) on Apply. Resyncing is content-based, not reference-based —
  // `values` gets a new object on every URL change (even unrelated ones,
  // like switching the indicator tab), which would otherwise wipe
  // in-progress edits every time the user navigates elsewhere.
  const [draft, setDraft] = useState<AppliedValues>(values)
  const appliedRef = useRef(values)

  useEffect(() => {
    if (JSON.stringify(values) !== JSON.stringify(appliedRef.current)) {
      appliedRef.current = values
      setDraft(values)
    }
  }, [values])

  const [from, to] = draft.yearRange
  const isDirty = JSON.stringify(draft) !== JSON.stringify(values)

  const applyFilters = () => {
    setFilter('countries', draft.countries)
    setFilter('yearRange', draft.yearRange)
  }

  return (
    <Card padding="sm" className="mb-4">
      <div className="flex flex-wrap items-start gap-4">
        <MultiSelect
          label="Countries"
          options={COUNTRY_OPTIONS.map((c) => ({ value: c.code, label: c.name }))}
          value={draft.countries}
          onChange={(next) => setDraft((d) => ({ ...d, countries: next }))}
          max={MAX_COUNTRIES}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text">Year range</span>
          <div className="flex items-center gap-2">
            <select
              aria-label="From year"
              className={selectClass}
              value={from}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  yearRange: [Number(e.target.value), Math.max(Number(e.target.value), to)],
                }))
              }
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <span className="text-text-muted">to</span>
            <select
              aria-label="To year"
              className={selectClass}
              value={to}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  yearRange: [Math.min(from, Number(e.target.value)), Number(e.target.value)],
                }))
              }
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-3 border-t border-border">
        <Button variant="primary" size="sm" onClick={applyFilters} disabled={!isDirty}>
          Apply
        </Button>
      </div>
    </Card>
  )
}

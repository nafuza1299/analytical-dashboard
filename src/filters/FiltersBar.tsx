import { useEffect, useRef, useState } from 'react'
import { Card } from '../catalyst-ui/components/Card/Card'
import { Button } from '../catalyst-ui/components/Button/Button'
import { MultiSelect } from '../catalyst-ui/components/MultiSelect/MultiSelect'
import { YearRangePicker } from '../catalyst-ui/components/YearRangePicker/YearRangePicker'
import { COUNTRY_OPTIONS } from '../data/countries'
import { MAX_COUNTRIES, MIN_YEAR, currentYear } from './registry'
import type { FilterValues } from './registry'

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

        <YearRangePicker
          label="Year range"
          value={draft.yearRange}
          onChange={(yearRange) => setDraft((d) => ({ ...d, yearRange }))}
          min={MIN_YEAR}
          max={currentYear()}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium invisible" aria-hidden="true">
            Apply
          </span>
          <Button variant="primary" size="md" onClick={applyFilters} disabled={!isDirty}>
            Apply
          </Button>
        </div>
      </div>
    </Card>
  )
}

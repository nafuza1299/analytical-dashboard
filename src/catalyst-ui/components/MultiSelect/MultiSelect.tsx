import { useState } from 'react'
import Select, {
  components as RSComponents,
  type ClassNamesConfig,
  type MenuProps,
  type MultiValue as RSMultiValue,
  type MultiValueProps,
  type OptionProps,
} from 'react-select'
import { Tag } from '../Tag/Tag'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  /** Accessible label, e.g. "Countries". */
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  /** Selection stops accepting new picks once reached. */
  max?: number
  /** Picked items can't be removed below this floor. Defaults to 0 (down to none — see "Clear all"). */
  min?: number
}

const classNames: ClassNamesConfig<MultiSelectOption, true> = {
  control: (state) =>
    [
      'rounded-md border bg-surface px-1 min-h-10 transition-colors duration-150',
      state.isFocused ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-text-muted',
    ].join(' '),
  valueContainer: () => 'gap-1 py-1 max-h-20 overflow-y-auto',
  placeholder: () => 'text-text-muted text-sm',
  input: () => 'text-text text-sm',
  indicatorSeparator: () => 'bg-border',
  dropdownIndicator: () => 'text-text-muted',
  clearIndicator: () => 'text-text-muted',
  menuPortal: () => 'z-50',
  menu: () => 'mt-1 rounded-lg border border-border bg-surface shadow-elevation overflow-hidden',
  menuList: () => 'max-h-72 overflow-y-auto py-1',
  noOptionsMessage: () => 'px-3 py-2 text-sm text-text-muted',
}

export function MultiSelect({ label, options, value, onChange, max, min = 0 }: MultiSelectProps) {
  // While the dropdown is open, edits are buffered here instead of calling
  // `onChange` immediately — checkmarks/count reflect this live, but chips
  // and everything outside the dropdown stay on `value` until it closes.
  const [pending, setPending] = useState<string[] | null>(null)
  const effective = pending ?? value
  const selected = options.filter((o) => value.includes(o.value))

  const commitChange = (next: string[]) => {
    if (pending !== null) setPending(next)
    else onChange(next)
  }

  const toggle = (code: string) => {
    const checked = effective.includes(code)
    if (checked) {
      if (effective.length <= min) return
      commitChange(effective.filter((v) => v !== code))
    } else {
      if (max !== undefined && effective.length >= max) return
      commitChange([...effective, code])
    }
  }

  // Checkmarks reflect the live in-progress `effective` selection, not
  // react-select's own `isSelected` (which is derived from the frozen
  // `selected`/`value` passed to the Select below).
  const Option = ({ data, isDisabled, isFocused, innerRef, innerProps }: OptionProps<MultiSelectOption, true>) => {
    const checked = effective.includes(data.value)
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={[
          'flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-text',
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          checked ? 'bg-primary/10' : isFocused ? 'bg-surface-hover' : '',
        ].join(' ')}
      >
        {data.label}
        {checked && (
          <span aria-hidden="true" className="text-primary">
            ✓
          </span>
        )}
      </div>
    )
  }

  const MultiValue = ({ data }: MultiValueProps<MultiSelectOption, true>) => (
    <span onMouseDown={(e) => e.stopPropagation()}>
      <Tag size="sm" dismissible onDismiss={() => toggle(data.value)}>
        {data.label}
      </Tag>
    </span>
  )

  const selectableCount = max !== undefined ? Math.min(max, options.length) : options.length

  const Menu = (props: MenuProps<MultiSelectOption, true>) => (
    <RSComponents.Menu {...props}>
      {props.children}
      {(effective.length > min || effective.length < selectableCount) && (
        <div className="flex border-t border-border">
          {effective.length < selectableCount && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commitChange(options.slice(0, selectableCount).map((o) => o.value))}
              className="flex-1 text-left px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-hover"
            >
              Select all
            </button>
          )}
          {effective.length > min && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commitChange(effective.slice(0, min))}
              className="flex-1 text-left px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 border-l border-border"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </RSComponents.Menu>
  )

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text">
        {label} ({effective.length})
      </span>
      <Select<MultiSelectOption, true>
        inputId={`multiselect-${label}`}
        aria-label={label}
        isMulti
        unstyled
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable={false}
        options={options}
        value={selected}
        onChange={(next: RSMultiValue<MultiSelectOption>) => commitChange(next.map((o) => o.value))}
        onMenuOpen={() => setPending(value)}
        onMenuClose={() => {
          onChange(pending ?? value)
          setPending(null)
        }}
        isOptionDisabled={(option) =>
          effective.includes(option.value) ? effective.length <= min : max !== undefined && effective.length >= max
        }
        components={{ Option, MultiValue, Menu }}
        classNames={classNames}
        menuPortalTarget={document.body}
        className="w-64"
      />
    </div>
  )
}

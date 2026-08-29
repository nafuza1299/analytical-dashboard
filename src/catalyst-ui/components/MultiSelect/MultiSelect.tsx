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
  const selected = options.filter((o) => value.includes(o.value))

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

  const Option = ({ data, isSelected, isDisabled, isFocused, innerRef, innerProps }: OptionProps<MultiSelectOption, true>) => (
    <div
      ref={innerRef}
      {...innerProps}
      className={[
        'flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-text',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        isSelected ? 'bg-primary/10' : isFocused ? 'bg-surface-hover' : '',
      ].join(' ')}
    >
      {data.label}
      {isSelected && (
        <span aria-hidden="true" className="text-primary">
          ✓
        </span>
      )}
    </div>
  )

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
      {(value.length > min || value.length < selectableCount) && (
        <div className="flex border-t border-border">
          {value.length < selectableCount && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(options.slice(0, selectableCount).map((o) => o.value))}
              className="flex-1 text-left px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-hover"
            >
              Select all
            </button>
          )}
          {value.length > min && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(value.slice(0, min))}
              className="flex-1 text-left px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-hover border-l border-border"
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
        {label} ({value.length})
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
        onChange={(next: RSMultiValue<MultiSelectOption>) => onChange(next.map((o) => o.value))}
        isOptionDisabled={(option) =>
          value.includes(option.value) ? value.length <= min : max !== undefined && value.length >= max
        }
        components={{ Option, MultiValue, Menu }}
        classNames={classNames}
        menuPortalTarget={document.body}
        className="w-64"
      />
    </div>
  )
}

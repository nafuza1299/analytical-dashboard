import Select, {
  type ClassNamesConfig,
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
  /** Last remaining picked item can't be removed below this. Defaults to 1. */
  min?: number
}

const classNames: ClassNamesConfig<MultiSelectOption, true> = {
  control: (state) =>
    [
      'rounded-md border bg-surface px-1 min-h-10 transition-colors duration-150',
      state.isFocused ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-text-muted',
    ].join(' '),
  valueContainer: () => 'gap-1 py-1',
  placeholder: () => 'text-text-muted text-sm',
  input: () => 'text-text text-sm',
  indicatorSeparator: () => 'bg-border',
  dropdownIndicator: () => 'text-text-muted',
  clearIndicator: () => 'text-text-muted',
  menu: () => 'mt-1 rounded-lg border border-border bg-surface shadow-elevation overflow-hidden z-50',
  menuList: () => 'max-h-72 overflow-y-auto py-1',
  noOptionsMessage: () => 'px-3 py-2 text-sm text-text-muted',
}

export function MultiSelect({ label, options, value, onChange, max, min = 1 }: MultiSelectProps) {
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

  return (
    <div className="flex flex-col gap-1.5">
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
        components={{ Option, MultiValue }}
        classNames={classNames}
        className="w-64"
      />
    </div>
  )
}

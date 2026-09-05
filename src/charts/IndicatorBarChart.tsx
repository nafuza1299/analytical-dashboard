import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { indicatorLabel } from '../navigation/menus'
import { latestYearRows } from './latestYearRows'
import { ChartTooltipContent } from './ChartTooltipContent'
import {
  axisTickStyle,
  cursorFill,
  formatCompact,
  gridStroke,
  indicatorSuffix,
  isCurrencyIndicator,
  tooltipProps,
  useTooltipCenterY,
} from './chartTheme'

interface Props {
  rows: DataRow[]
}

export function IndicatorBarChart({ rows }: Props) {
  const { onResize, position } = useTooltipCenterY()
  const yearRows = latestYearRows(rows)
  if (yearRows.length === 0) return null
  const isCurrency = isCurrencyIndicator(rows[0]?.indicatorCode)
  const suffix = indicatorSuffix(rows[0]?.indicatorCode)

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200} onResize={onResize}>
      <BarChart data={yearRows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="countryName" tick={axisTickStyle} />
        <YAxis width={70} tickFormatter={formatCompact} tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={cursorFill}
          position={position}
          content={(props) => <ChartTooltipContent {...props} isCurrency={isCurrency} suffix={suffix} />}
          {...tooltipProps}
        />
        <Bar dataKey="value" name={indicatorLabel(rows[0]?.indicatorCode) ?? yearRows[0]?.indicatorName} fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  )
}

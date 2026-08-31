import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { latestYearRows } from './latestYearRows'
import { axisTickStyle, cursorFill, formatCompact, formatFull, gridStroke, tooltipProps } from './chartTheme'

interface Props {
  rows: DataRow[]
}

export function IndicatorBarChart({ rows }: Props) {
  const yearRows = latestYearRows(rows)
  if (yearRows.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <BarChart data={yearRows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="countryName" tick={axisTickStyle} />
        <YAxis width={70} tickFormatter={formatCompact} tick={axisTickStyle} />
        <Tooltip formatter={(value) => formatFull(Number(value))} cursor={cursorFill} {...tooltipProps} />
        <Bar dataKey="value" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  )
}

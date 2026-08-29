import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { latestYearRows } from './latestYearRows'
import { formatCompact, formatFull } from './chartTheme'

interface Props {
  rows: DataRow[]
  indicatorName: string
}

export function IndicatorBarChart({ rows, indicatorName }: Props) {
  const yearRows = latestYearRows(rows)
  if (yearRows.length === 0) return null
  const year = yearRows[0].year

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={yearRows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="countryName"
          label={{ value: `Country (${year})`, position: 'insideBottom', offset: -4 }}
        />
        <YAxis
          width={70}
          tickFormatter={formatCompact}
          label={{ value: indicatorName, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip formatter={(value: number) => formatFull(value)} />
        <Bar dataKey="value" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  )
}

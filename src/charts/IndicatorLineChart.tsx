import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DataRow } from '../api/worldBank'
import { pivotByYear } from './pivotByYear'
import { CHART_COLORS, formatCompact, formatFull, legendProps, xAxisTickProps } from './chartTheme'

interface Props {
  rows: DataRow[]
  indicatorName: string
}

export function IndicatorLineChart({ rows, indicatorName }: Props) {
  const data = pivotByYear(rows)
  const countries = [...new Map(rows.map((r) => [r.countryCode, r.countryName]))]

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          {...xAxisTickProps}
          label={{ value: 'Year', position: 'insideBottom', offset: -4 }}
        />
        <YAxis
          width={70}
          tickFormatter={formatCompact}
          label={{ value: indicatorName, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip formatter={(value) => formatFull(Number(value))} />
        <Legend {...legendProps} />
        {countries.map(([code, name], i) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            name={name}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            connectNulls={false}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

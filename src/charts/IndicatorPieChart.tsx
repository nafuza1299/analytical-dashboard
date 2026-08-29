import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { latestYearRows } from './latestYearRows'
import { isAdditiveIndicator } from './additiveIndicators'
import { CHART_COLORS, formatFull, legendProps } from './chartTheme'

interface Props {
  rows: DataRow[]
  indicatorCode: string
}

/** Share-of-total across countries for one year. Hidden entirely for non-additive
 * indicators (rates, percentages, per-capita) — summing those is meaningless. */
export function IndicatorPieChart({ rows, indicatorCode }: Props) {
  if (!isAdditiveIndicator(indicatorCode)) return null

  const yearRows = latestYearRows(rows).filter((r) => r.value !== null && r.value > 0)
  if (yearRows.length === 0) return null
  const year = yearRows[0].year

  return (
    <div>
      <p className="text-sm text-text-muted mb-2">Share of total ({year})</p>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={yearRows}
            dataKey="value"
            nameKey="countryName"
            label={(entry) => entry.name}
            // ponytail: recharts 3.10.1's Pie animation gets stuck and never
            // renders a sector in this React 19/StrictMode setup — disabling
            // it is the fix, not a stylistic choice. Revisit if recharts patches it.
            isAnimationActive={false}
          >
            {yearRows.map((r, i) => (
              <Cell key={r.countryCode} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatFull(Number(value))} />
          <Legend {...legendProps} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

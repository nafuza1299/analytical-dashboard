import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { latestYearRows } from './latestYearRows'
import { isAdditiveIndicator } from './additiveIndicators'
import { CHART_COLORS, formatFull, legendProps, tooltipProps } from './chartTheme'

interface Props {
  rows: DataRow[]
  indicatorCode: string
}

type SectorProps = {
  cx?: number
  cy?: number
  innerRadius?: number
  outerRadius?: number
  startAngle?: number
  endAngle?: number
  midAngle?: number
  fill?: string
  name?: string
  index?: number
}

const RADIAN = Math.PI / 180

// Buckets label positions and skips any slice whose bucket is already
// taken, same overlap-hiding approach as the line chart's point labels.
//
// ponytail: recharts 3.10.1's Pie label pipeline (the `label` prop /
// PieLabels) reads a "sectors" snapshot that goes stale independently of
// the one driving the actual wedge paths — it settles permanently at
// outerRadius:0 (confirmed via debug logging: the wedges render at the
// correct ~145px radius while `label`'s own geometry pass freezes at 0,
// mirroring the animation-stuck class of bug already worked around
// elsewhere in this file and in the line chart). Rendering the label
// inside the `shape` prop instead sidesteps it entirely — `shape` drives
// the wedges themselves, so its geometry is the reliable one.
function makeOverlapAwareSector() {
  const seenBuckets = new Set<string>()
  const decided = new Map<number, boolean>()
  return function renderSector(props: SectorProps) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, midAngle, fill, name, index } = props
    if (cx == null || cy == null || !outerRadius) return null
    const labelRadius = outerRadius + 12
    const lx = cx + labelRadius * Math.cos(-(midAngle ?? 0) * RADIAN)
    const ly = cy + labelRadius * Math.sin(-(midAngle ?? 0) * RADIAN)
    let showLabel = index != null ? decided.get(index) : undefined
    if (showLabel === undefined) {
      const key = `${Math.round(lx / 50)}:${Math.round(ly / 16)}`
      showLabel = !seenBuckets.has(key)
      if (showLabel) seenBuckets.add(key)
      if (index != null) decided.set(index, showLabel)
    }
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="var(--color-surface)"
        />
        {showLabel && (
          <text
            x={lx}
            y={ly}
            textAnchor={lx > cx ? 'start' : 'end'}
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="var(--font-sans)"
            fill="var(--color-text)"
          >
            {name}
          </text>
        )}
      </g>
    )
  }
}

/** Share-of-total across countries for one year. Hidden entirely for non-additive
 * indicators (rates, percentages, per-capita) — summing those is meaningless. */
export function IndicatorPieChart({ rows, indicatorCode }: Props) {
  if (!isAdditiveIndicator(indicatorCode)) return null

  const yearRows = latestYearRows(rows).filter((r) => r.value !== null && r.value > 0)
  if (yearRows.length === 0) return null
  const year = yearRows[0].year

  return (
    <div className="flex h-full flex-col">
      <p className="text-sm text-text-muted mb-2">Share of total ({year})</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <PieChart>
            <Pie
              data={yearRows}
              dataKey="value"
              nameKey="countryName"
              outerRadius="65%"
              shape={makeOverlapAwareSector()}
              // ponytail: recharts 3.10.1's Pie animation gets stuck and never
              // renders a sector in this React 19/StrictMode setup — disabling
              // it is the fix, not a stylistic choice. Revisit if recharts patches it.
              isAnimationActive={false}
            >
              {yearRows.map((r, i) => (
                <Cell key={r.countryCode} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatFull(Number(value))} {...tooltipProps} />
            <Legend {...legendProps} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

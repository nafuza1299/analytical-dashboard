import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { latestYearRows } from './latestYearRows'
import { isAdditiveIndicator } from './additiveIndicators'
import { ChartTooltipContent } from './ChartTooltipContent'
import {
  CHART_COLORS,
  indicatorSuffix,
  isCurrencyIndicator,
  legendItemStyle,
  legendProps,
  tooltipProps,
  useLegendSelection,
  useTooltipCenterY,
} from './chartTheme'

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
  isActive?: boolean
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
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, midAngle, fill, name, index, isActive } = props
    // Legend-hidden countries are zeroed to 0 rather than removed (see
    // IndicatorPieChart), which collapses their wedge to a zero-degree
    // angle — draw nothing for it, or its label would still float at
    // that angle with no visible slice behind it.
    if (cx == null || cy == null || !outerRadius || startAngle === endAngle) return null
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
    // Hovering a slice always shows its label plus a leader line to it,
    // even if overlap-hiding suppressed that label normally.
    const edgePoint = {
      x: cx + outerRadius * Math.cos(-(midAngle ?? 0) * RADIAN),
      y: cy + outerRadius * Math.sin(-(midAngle ?? 0) * RADIAN),
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
        {isActive && (
          <line x1={edgePoint.x} y1={edgePoint.y} x2={lx} y2={ly} stroke={fill} />
        )}
        {(showLabel || isActive) && (
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
  const { onResize, position } = useTooltipCenterY()
  const yearRows = latestYearRows(rows).filter((r) => r.value !== null && r.value > 0)
  const { isHidden, onLegendClick } = useLegendSelection(yearRows.map((r) => r.countryCode))
  if (!isAdditiveIndicator(indicatorCode)) return null
  if (yearRows.length === 0) return null
  const year = yearRows[0].year
  const isCurrency = isCurrencyIndicator(indicatorCode)
  const suffix = indicatorSuffix(indicatorCode)
  // Zeroing out a hidden country's value (instead of removing its row) keeps
  // it in the Pie's data — and therefore in the Legend, which derives its
  // items from that data — while recomputing every other slice's share of
  // total to exclude it, same as removing it from the sum would.
  const visibleRows = yearRows.map((r) => (isHidden(r.countryCode) ? { ...r, value: 0 } : r))

  return (
    <div className="flex h-full flex-col">
      <p className="text-sm text-text-muted mb-2">Share of total ({year})</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={200} onResize={onResize}>
          <PieChart>
            <Pie
              data={visibleRows}
              dataKey="value"
              nameKey="countryName"
              outerRadius="65%"
              shape={makeOverlapAwareSector()}
              // ponytail: recharts 3.10.1's Pie animation gets stuck and never
              // renders a sector in this React 19/StrictMode setup — disabling
              // it is the fix, not a stylistic choice. Revisit if recharts patches it.
              isAnimationActive={false}
            >
              {visibleRows.map((r, i) => (
                <Cell key={r.countryCode} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              position={position}
              content={(props) => <ChartTooltipContent {...props} isCurrency={isCurrency} suffix={suffix} />}
              {...tooltipProps}
            />
            <Legend
              {...legendProps}
              onClick={(entry, _index, event) =>
                onLegendClick((entry.payload as { countryCode: string }).countryCode, event)
              }
              formatter={(value, entry) => (
                <span style={legendItemStyle(isHidden((entry.payload as { countryCode: string }).countryCode))}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

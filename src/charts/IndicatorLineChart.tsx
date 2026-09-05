import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DataRow } from '../api/worldBank'
import { pivotByYear } from './pivotByYear'
import { ChartTooltipContent } from './ChartTooltipContent'
import {
  CHART_COLORS,
  axisTickStyle,
  cursorLine,
  formatCompact,
  gridStroke,
  indicatorSuffix,
  isCurrencyIndicator,
  legendItemStyle,
  legendProps,
  tooltipProps,
  useLegendSelection,
  useTooltipCenterY,
  xAxisTickProps,
} from './chartTheme'

interface Props {
  rows: DataRow[]
}

type DotRenderProps = { cx?: number; cy?: number; value?: number | string; index?: number }

// Buckets label positions into a coarse grid and skips any point whose
// bucket is already taken — cheap stand-in for real collision detection,
// good enough to keep a chart with dozens of series legible.
//
// ponytail: recharts 3.10.1's Line <LabelList>/`label` pipeline is gated by
// the same stuck-animation state machine as the Pie chart's known bug, so
// labels drawn that way appear then vanish — drawing the label inside the
// `dot` renderer sidesteps it. But recharts also calls `dot` twice per
// point (an interaction layer plus the painted one); a plain mutable Set
// makes the second call always see its own point as "already taken" and
// hide everything. Caching the decision per point `index` makes repeat
// calls for the same point idempotent instead of self-colliding.
// Shared across every series on the chart, so "hide overlap" suppresses
// collisions between different countries' points too, not just within one
// line's own years.
function makeSharedDotLabeler() {
  const seenBuckets = new Set<string>()
  const decided = new Map<string, boolean>()
  return function dotLabelerFor(code: string, color: string) {
    return function renderDot({ cx, cy, value, index }: DotRenderProps) {
      if (cx == null || cy == null) return null
      const pointKey = `${code}-${index}`
      let showLabel = decided.get(pointKey)
      if (showLabel === undefined) {
        const bucketKey = `${Math.round(cx / 40)}:${Math.round(cy / 16)}`
        showLabel = value != null && !seenBuckets.has(bucketKey)
        if (showLabel) seenBuckets.add(bucketKey)
        decided.set(pointKey, showLabel)
      }
      return (
        <g>
          <circle cx={cx} cy={cy} r={3} fill={color} stroke="none" />
          {showLabel && (
            <text
              x={cx}
              y={cy}
              dy={-6}
              textAnchor="middle"
              fontSize={9}
              fontFamily="var(--font-sans)"
              fill="var(--color-text-muted)"
            >
              {formatCompact(Number(value))}
            </text>
          )}
        </g>
      )
    }
  }
}

export function IndicatorLineChart({ rows }: Props) {
  const { onResize, position } = useTooltipCenterY()
  const data = pivotByYear(rows)
  const countries = [...new Map(rows.map((r) => [r.countryCode, r.countryName]))]
  const dotLabelerFor = makeSharedDotLabeler()
  const isCurrency = isCurrencyIndicator(rows[0]?.indicatorCode)
  const suffix = indicatorSuffix(rows[0]?.indicatorCode)
  const { isHidden, onLegendClick } = useLegendSelection(countries.map(([code]) => code))

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200} onResize={onResize}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="year" {...xAxisTickProps} />
        <YAxis width={70} tickFormatter={formatCompact} tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={cursorLine}
          position={position}
          content={(props) => <ChartTooltipContent {...props} isCurrency={isCurrency} suffix={suffix} />}
          {...tooltipProps}
        />
        <Legend
          {...legendProps}
          onClick={(entry, _index, event) => onLegendClick(String(entry.dataKey), event)}
          formatter={(value, entry) => (
            <span style={legendItemStyle(isHidden(String(entry.dataKey)))}>{value}</span>
          )}
        />
        {countries.map(([code, name], i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length]
          return (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              name={name}
              stroke={color}
              connectNulls={false}
              dot={dotLabelerFor(code, color)}
              hide={isHidden(code)}
            />
          )
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}

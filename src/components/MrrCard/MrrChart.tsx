import { useId } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { colors } from '../../styles/colors'
import type { RevenueBucket } from '../../lib/dashboard-aggregations'
import { ChartTooltip } from '../ui/ChartTooltip/ChartTooltip'

interface ShapeProps { fill?: string; x?: number; y?: number; width?: number; height?: number }

function RoundedBar(props: ShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, fill } = props
  const r = 3
  const d = `M${x},${y} H${x + width} V${y + height - r} A${r},${r} 0 0 1 ${x + width - r},${y + height} H${x + r} A${r},${r} 0 0 1 ${x},${y + height - r} Z`
  return <path d={d} fill={fill} />
}

interface GlassBarProps extends ShapeProps { gradId?: string }

function GlassBar(props: GlassBarProps) {
  const { x, y, width, height, gradId } = props
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={gradId ? `url(#${gradId})` : undefined}
      rx={3}
      ry={3}
    />
  )
}

const formatTooltip = (_value: number, payload: { value: number; dataKey?: string }[], label: string) => {
  const revenueEntry = payload.find(p => p.dataKey === 'revenue')
  const value = revenueEntry?.value ?? payload[0].value
  return `${label} — $${value}k revenue`
}

interface MrrChartProps {
  data: RevenueBucket[]
}

export function MrrChart({ data }: MrrChartProps) {
  const id = useId()
  const glassGradId = `${id}-glassGrad`

  function getBarColor(index: number): string {
    if (index === 0) return colors.success
    return data[index].revenue >= data[index - 1].revenue ? colors.success : colors.danger
  }

  const maxVal = Math.max(...data.map(d => d.gray), ...data.map(d => d.revenue), 0.1)
  const domainMax = Math.ceil(maxVal * 1.2) || 6

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        barCategoryGap="10%"
        maxBarSize={32}
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <defs>
          <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.text} stopOpacity={0.25} />
            <stop offset="100%" stopColor={colors.text} stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <XAxis xAxisId="glass" dataKey="name" hide />
        <XAxis xAxisId="color" dataKey="name" hide />
        <YAxis hide domain={[0, domainMax]} />
        <Tooltip
          content={<ChartTooltip formatter={formatTooltip} />}
          cursor={{ fill: 'oklch(0.933 0 0 / 0.06)' }}
        />
        <Bar
          xAxisId="glass"
          dataKey="gray"
          fill="oklch(0.933 0 0 / 0.2)"
          radius={[3, 3, 0, 0]}
          shape={<GlassBar gradId={glassGradId} />}
        />
        <Bar
          xAxisId="color"
          dataKey="revenue"
          radius={0}
          shape={<RoundedBar />}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={getBarColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

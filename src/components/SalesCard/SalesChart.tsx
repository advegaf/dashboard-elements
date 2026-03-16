import { useId } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueBucket } from '../../lib/dashboard-aggregations'

interface ShapeProps { fill?: string; x?: number; y?: number; width?: number; height?: number; glowId?: string }

function GlowBar(props: ShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, fill, glowId } = props
  const r = 3
  const d = `M${x},${y} H${x + width} V${y + height - r} A${r},${r} 0 0 1 ${x + width - r},${y + height} H${x + r} A${r},${r} 0 0 1 ${x},${y + height - r} Z`
  return (
    <path
      d={d}
      fill={fill}
      filter={glowId ? `url(#${glowId})` : undefined}
    />
  )
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

interface SalesChartProps {
  data: RevenueBucket[]
}

export function SalesChart({ data }: SalesChartProps) {
  const id = useId()
  const glassGradId = `${id}-glassGrad`
  const barGlowId = `${id}-barGlow`

  function getBarColor(index: number): string {
    if (index === 0) return '#22995F'
    return data[index].revenue >= data[index - 1].revenue ? '#22995F' : '#E05552'
  }

  const maxVal = Math.max(...data.map(d => d.gray), ...data.map(d => d.revenue), 0.1)
  const domainMax = Math.ceil(maxVal * 1.2) || 6
  const tickStep = domainMax / 3
  const ticks = [0, Math.round(tickStep * 10) / 10, Math.round(tickStep * 2 * 10) / 10, domainMax]

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          barGap={-32}
          barCategoryGap="20%"
          margin={{ top: 5, right: 20, left: -5, bottom: 0 }}
        >
          <defs>
            <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
            </linearGradient>
            <filter id={barGlowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            width={35}
            ticks={ticks}
            domain={[0, domainMax]}
            tickFormatter={(v: number) => `$${v}k`}
          />
          <Bar
            dataKey="gray"
            fill="rgba(255,255,255,0.2)"
            radius={[3, 3, 0, 0]}
            barSize={32}
            shape={<GlassBar gradId={glassGradId} />}
          />
          <Bar
            dataKey="revenue"
            radius={0}
            barSize={32}
            shape={<GlowBar glowId={barGlowId} />}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

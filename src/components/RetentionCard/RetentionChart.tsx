import { useId } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
  Tooltip,
} from 'recharts'
import { colors } from '../../styles/colors'
import type { RetentionBucket } from '../../lib/dashboard-aggregations'
import { ChartTooltip } from '../ui/ChartTooltip/ChartTooltip'
import { PulseDot } from '../ui/PulseDot/PulseDot'

interface RetentionChartProps {
  data: RetentionBucket[]
}

const formatTooltip = (value: number, _p: unknown, label: string) =>
  `${label} — ${value}%`

export function RetentionChart({ data }: RetentionChartProps) {
  const id = useId()
  const gradientId = `${id}-retentionGradient`

  if (data.length === 0) return null

  const lastPoint = data[data.length - 1]
  const minValue = Math.min(...data.map(d => d.value))
  const floor = Math.max(0, Math.floor((minValue - 5) / 5) * 5)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.success} stopOpacity={0.3} />
            <stop offset="100%" stopColor={colors.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide domain={[floor, 100]} />
        <Tooltip
          content={<ChartTooltip formatter={formatTooltip} />}
          cursor={{ stroke: 'oklch(0.933 0 0 / 0.2)' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors.success}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
        <ReferenceDot
          x={lastPoint.name}
          y={lastPoint.value}
          r={4}
          fill="transparent"
          stroke="none"
          shape={<PulseDot />}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

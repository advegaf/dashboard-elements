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
import type { SignupBucket } from '../../lib/dashboard-aggregations'
import { ChartTooltip } from '../ui/ChartTooltip/ChartTooltip'
import { PulseDot } from '../ui/PulseDot/PulseDot'

interface SignupsChartProps {
  data: SignupBucket[]
}

const formatTooltip = (value: number, _p: unknown, label: string) =>
  `${label} — ${value} sign-ups`

export function SignupsChart({ data }: SignupsChartProps) {
  const id = useId()
  const gradientId = `${id}-signupsGradient`

  if (data.length === 0) return null

  const lastPoint = data[data.length - 1]
  const maxValue = Math.max(...data.map(d => d.value), 1)

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
        <YAxis hide domain={[0, Math.ceil(maxValue * 1.2)]} />
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

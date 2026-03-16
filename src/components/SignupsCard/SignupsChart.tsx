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
import type { SignupBucket } from '../../lib/dashboard-aggregations'
import styles from './SignupsChart.module.css'

interface SignupsChartProps {
  data: SignupBucket[]
}

function CustomLabel({ viewBox, lastValue }: { viewBox?: { x: number; y: number }; lastValue: number }) {
  if (!viewBox) return null
  return (
    <text
      x={viewBox.x + 4}
      y={viewBox.y - 12}
      fill="#22995F"
      fontSize={11}
      fontWeight={600}
      textAnchor="end"
    >
      +{lastValue} new
    </text>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        borderRadius: 8,
        padding: '6px 10px',
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        whiteSpace: 'nowrap',
      }}
    >
      {label} — {payload[0].value} sign-ups
    </div>
  )
}

function PulseDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#22995F" stroke="#fff" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={4} fill="none" stroke="#22995F" className={styles.pulseRing} />
    </g>
  )
}

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
            <stop offset="0%" stopColor="#22995F" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22995F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide domain={[0, Math.ceil(maxValue * 1.2)]} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#22995F"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
        <ReferenceDot
          x={lastPoint.name}
          y={lastPoint.value}
          r={4}
          fill="transparent"
          stroke="none"
          label={<CustomLabel lastValue={lastPoint.value} />}
          shape={<PulseDot />}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

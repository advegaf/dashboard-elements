import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
  Tooltip,
} from 'recharts'

const data = [
  { name: 'Feb 5', value: 5 },
  { name: 'Feb 8', value: 7 },
  { name: 'Feb 11', value: 4 },
  { name: 'Feb 14', value: 9 },
  { name: 'Feb 17', value: 6 },
  { name: 'Feb 20', value: 8 },
  { name: 'Feb 23', value: 10 },
  { name: 'Feb 26', value: 7 },
  { name: 'Mar 1', value: 12 },
  { name: 'Mar 5', value: 15 },
]

function CustomLabel({ viewBox }: { viewBox?: { x: number; y: number } }) {
  if (!viewBox) return null
  return (
    <text
      x={viewBox.x}
      y={viewBox.y - 12}
      fill="#22c55e"
      fontSize={11}
      fontWeight={600}
      textAnchor="middle"
    >
      +38 new
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
      <circle cx={cx} cy={cy} r={4} fill="#22c55e" stroke="#fff" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={4} fill="none" stroke="#22c55e" className="pulse-ring" />
    </g>
  )
}

export function SignupsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <style>{`
            @keyframes pulse {
              0% { r: 4; opacity: 0.6; }
              100% { r: 14; opacity: 0; }
            }
            .pulse-ring { animation: pulse 2s ease-out infinite; }
          `}</style>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide domain={[0, 18]} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#signupsGradient)"
        />
        <ReferenceDot
          x="Mar 5"
          y={15}
          r={4}
          fill="transparent"
          stroke="none"
          label={<CustomLabel />}
          shape={<PulseDot />}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

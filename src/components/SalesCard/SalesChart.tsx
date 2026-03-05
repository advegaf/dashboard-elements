import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  type BarProps,
} from 'recharts'

function GlowBar(props: BarProps & { fill?: string; x?: number; y?: number; width?: number; height?: number }) {
  const { x = 0, y = 0, width = 0, height = 0, fill } = props
  const r = 3
  const d = `M${x},${y} H${x + width} V${y + height - r} A${r},${r} 0 0 1 ${x + width - r},${y + height} H${x + r} A${r},${r} 0 0 1 ${x},${y + height - r} Z`
  return (
    <path
      d={d}
      fill={fill}
      filter="url(#orangeGlow)"
    />
  )
}

function GlassBar(props: BarProps & { x?: number; y?: number; width?: number; height?: number }) {
  const { x, y, width, height } = props
  const gradientId = `glassGrad-${x}-${y}`
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        rx={3}
        ry={3}
      />
    </g>
  )
}

const data = [
  { name: 'Feb 5', gray: 3.2, orange: 1.8 },
  { name: 'Feb 9', gray: 4.5, orange: 2.4 },
  { name: 'Feb 13', gray: 3.8, orange: 2.1 },
  { name: 'Feb 17', gray: 5.1, orange: 3.0 },
  { name: 'Feb 21', gray: 4.2, orange: 2.5 },
  { name: 'Feb 25', gray: 4.8, orange: 2.8 },
  { name: 'Mar 1', gray: 5.5, orange: 3.2 },
  { name: 'Mar 5', gray: 5.8, orange: 3.5 },
]

export function SalesChart() {
  const ticks = [0, 2, 4, 6]
  const domainMax = 6

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
            <filter id="orangeGlow" x="-50%" y="-50%" width="200%" height="200%">
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
            shape={<GlassBar />}
          />
          <Bar
            dataKey="orange"
            fill="#f59e0b"
            radius={0}
            barSize={32}
            shape={<GlowBar />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

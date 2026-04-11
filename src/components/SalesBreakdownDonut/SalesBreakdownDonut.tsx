import { useState } from 'react'
import { PieChart, Pie, Cell, Label, Sector, ResponsiveContainer } from 'recharts'
import type { RevenueSlice } from '../../lib/dashboard-aggregations'

const RADIAN = Math.PI / 180

function renderActiveShape(props: unknown) {
  const p = props as Record<string, unknown>
  return <Sector {...p} outerRadius={(p.outerRadius as number) + 4} />
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  outerRadius: number
  name: string
  percent: number
}

function renderLabel(props: LabelProps) {
  const { cx, cy, midAngle, outerRadius, name, percent } = props
  const cos = Math.cos(-midAngle * RADIAN)
  const sin = Math.sin(-midAngle * RADIAN)

  const sx = cx + outerRadius * cos
  const sy = cy + outerRadius * sin
  const mx = cx + (outerRadius + 12) * cos
  const my = cy + (outerRadius + 12) * sin
  const ex = mx + (cos >= 0 ? 16 : -16)
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <polyline
        points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
        stroke="oklch(0.933 0 0 / 0.3)"
        fill="none"
        strokeWidth={1}
      />
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="oklch(0.933 0 0 / 0.7)"
        fontSize={12}
        fontFamily="'Inter', sans-serif"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  )
}

interface SalesBreakdownDonutProps {
  slices: RevenueSlice[]
  colors: string[]
  total: string
}

export function SalesBreakdownDonut({ slices, colors, total }: SalesBreakdownDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <defs>
            <linearGradient id="glassRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.933 0 0)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="oklch(0.933 0 0)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Pie
            data={[{ value: 1 }]}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            fill="url(#glassRingGrad)"
            stroke="none"
            isAnimationActive={false}
          />
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            label={renderLabel}
            labelLine={false}
            isAnimationActive={false}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <Label
              position="center"
              content={({ viewBox }: any) => {
                const { cx, cy } = viewBox
                return (
                  <g>
                    <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" fill="oklch(0.933 0 0)" fontSize={20} fontWeight={700} fontFamily="'Inter', sans-serif">
                      {total}
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central" fill="oklch(0.933 0 0 / 0.5)" fontSize={11} fontFamily="'Inter', sans-serif">
                      Total Revenue
                    </text>
                  </g>
                )
              }}
            />
            {slices.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

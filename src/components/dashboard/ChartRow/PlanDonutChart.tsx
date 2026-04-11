import * as React from 'react'
import { Label, Pie, PieChart, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { PlanSlice } from '@/hooks/useOverviewData'

const chartConfig = {
  monthly: { label: 'Monthly', color: 'var(--chart-1)' },
  annual: { label: 'Annual', color: 'var(--chart-2)' },
  dayPass: { label: 'Day Pass', color: 'var(--chart-4)' },
  trial: { label: 'Trial', color: 'var(--chart-5)' },
} satisfies ChartConfig

const planToKey: Record<string, keyof typeof chartConfig> = {
  Monthly: 'monthly',
  Annual: 'annual',
  'Day Pass': 'dayPass',
  Trial: 'trial',
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function PlanDonutChart({ data }: { data: PlanSlice[] }) {
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => b.revenue - a.revenue),
    [data],
  )

  const pieData = React.useMemo(
    () =>
      sortedData.map((slice) => ({
        ...slice,
        fill: chartConfig[planToKey[slice.plan]]?.color ?? slice.fill,
      })),
    [sortedData],
  )

  const defaultPlan = sortedData[0]?.plan
  const [activePlan, setActivePlan] = React.useState<string | undefined>(defaultPlan)

  React.useEffect(() => {
    setActivePlan(defaultPlan)
  }, [defaultPlan])

  const total = sortedData.reduce((sum, slice) => sum + slice.revenue, 0)
  const formattedTotal = currency.format(total)
  const activeSlice = sortedData.find((s) => s.plan === activePlan)

  if (sortedData.length === 0) {
    return (
      <Card className="h-[360px]">
        <CardHeader>
          <CardDescription>Revenue by plan</CardDescription>
          <CardTitle className="text-2xl tabular-nums">$0</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
            No data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <CardDescription>Revenue by plan</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{formattedTotal}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-0">
        <div onMouseLeave={() => setActivePlan(defaultPlan)}>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-44">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="revenue"
                nameKey="plan"
                innerRadius={44}
                outerRadius={72}
                strokeWidth={2}
                onMouseEnter={(entry: { payload?: { plan?: string } }) => {
                  const plan = entry?.payload?.plan
                  if (plan) setActivePlan(plan)
                }}
                shape={(props: PieSectorDataItem) => {
                  const sectorProps = props as PieSectorDataItem & {
                    payload?: { plan?: string }
                  }
                  const isActive = sectorProps.payload?.plan === activePlan
                  const baseOuter = props.outerRadius ?? 0
                  return (
                    <Sector
                      {...props}
                      outerRadius={isActive ? baseOuter + 6 : baseOuter}
                    />
                  )
                }}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                    const cx = viewBox.cx as number
                    const cy = viewBox.cy as number
                    if (!activeSlice) return null
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={cx}
                          y={cy - 2}
                          className="fill-foreground text-lg font-semibold tabular-nums"
                        >
                          {currency.format(activeSlice.revenue)}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 14}
                          className="fill-muted-foreground text-[11px]"
                        >
                          Revenue
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {sortedData.map((slice) => {
              const key = planToKey[slice.plan]
              const color = key ? chartConfig[key].color : slice.fill
              const isActive = slice.plan === activePlan
              return (
                <span
                  key={slice.plan}
                  className={
                    'flex items-center gap-1.5 transition-opacity ' +
                    (isActive ? 'opacity-100' : 'opacity-70')
                  }
                >
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ background: color }}
                  />
                  {slice.plan}
                </span>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

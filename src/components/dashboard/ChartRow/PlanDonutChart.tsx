import * as React from 'react'
import { Label, Pie, PieChart, Sector } from 'recharts'
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PlanKey, PlanSlice } from '@/hooks/useOverviewData'

const chartConfig = {
  revenue: { label: 'Revenue' },
  plan:    { label: 'Plan' },
  monthly: { label: 'Monthly',  color: 'var(--chart-1)' },
  annual:  { label: 'Annual',   color: 'var(--chart-2)' },
  dayPass: { label: 'Day Pass', color: 'var(--chart-3)' },
  trial:   { label: 'Trial',    color: 'var(--chart-4)' },
} satisfies ChartConfig

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function PlanDonutChart({ data }: { data: PlanSlice[] }) {
  const id = 'plan-donut'
  const [activePlan, setActivePlan] = React.useState<PlanKey>(data[0].plan)

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.plan === activePlan),
    [activePlan, data],
  )
  const plans = React.useMemo(() => data.map((item) => item.plan), [data])

  const renderPieShape = React.useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector
              {...props}
              outerRadius={outerRadius + 25}
              innerRadius={outerRadius + 12}
            />
          </g>
        )
      }

      return <Sector {...props} outerRadius={outerRadius} />
    },
    [activeIndex],
  )

  const activeSlice = data[activeIndex]
  const activeLabel = chartConfig[activePlan].label
  const activeRevenue = currency.format(activeSlice?.revenue ?? 0)

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Revenue by plan</CardTitle>
          <CardDescription>Monthly · Annual · Day Pass · Trial</CardDescription>
        </div>
        <Select value={activePlan} onValueChange={(value) => setActivePlan(value as PlanKey)}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a plan"
          >
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {plans.map((key) => {
              const config = chartConfig[key]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="plan"
              innerRadius={60}
              strokeWidth={5}
              shape={renderPieShape}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activeRevenue}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {activeLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

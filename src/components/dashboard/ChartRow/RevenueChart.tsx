import * as React from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis } from 'recharts'

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
import type { RevenuePoint } from '@/hooks/useOverviewData'

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const id = 'revenue-chart'
  const [activeMonth, setActiveMonth] = React.useState(
    data[data.length - 1]?.month ?? '',
  )

  const months = React.useMemo(() => data.map((item) => item.month), [data])
  const activePoint = React.useMemo(
    () => data.find((item) => item.month === activeMonth),
    [data, activeMonth],
  )

  const activeRevenue = currency.format(activePoint?.revenue ?? 0)

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="tabular-nums">{activeRevenue}</CardTitle>
          <CardDescription>Revenue — {activeMonth}</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a month"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => (
              <SelectItem
                key={key}
                value={key}
                className="rounded-lg [&_span]:flex"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: 'var(--color-revenue)' }}
                  />
                  {key}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 items-end pb-0">
        <ChartContainer id={id} config={chartConfig} className="h-44 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-revenue)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill={`url(#fill-${id})`}
            />
            <ReferenceLine
              x={activeMonth}
              stroke="var(--color-revenue)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

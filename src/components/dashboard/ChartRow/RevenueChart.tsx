import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { RevenuePoint } from '@/hooks/useOverviewData'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const latest = data[data.length - 1]?.revenue ?? 0
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(latest)

  return (
    <Card>
      <CardHeader>
        <CardDescription>Revenue</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{formatted}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-44 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
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
              fill="url(#fillRevenue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

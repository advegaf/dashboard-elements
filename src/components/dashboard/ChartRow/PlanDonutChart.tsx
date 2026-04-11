import { Pie, PieChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { PlanSlice } from '@/hooks/useOverviewData'

const chartConfig = {
  revenue: { label: 'Revenue' },
  Monthly:  { label: 'Monthly',  color: 'var(--chart-1)' },
  Annual:   { label: 'Annual',   color: 'var(--chart-2)' },
  'Day Pass': { label: 'Day Pass', color: 'var(--chart-3)' },
  Trial:    { label: 'Trial',    color: 'var(--chart-4)' },
} satisfies ChartConfig

export function PlanDonutChart({ data }: { data: PlanSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.revenue, 0)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(total)

  return (
    <Card>
      <CardHeader>
        <CardDescription>Revenue by plan</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{formatted}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-44">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="plan" hideLabel />}
            />
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="plan"
              innerRadius={48}
              strokeWidth={2}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="plan" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

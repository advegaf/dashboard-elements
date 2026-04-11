import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { SignupPoint } from '@/hooks/useOverviewData'

const chartConfig = {
  signups: {
    label: 'Signups',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function SignupsChart({ data }: { data: SignupPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.signups, 0)

  return (
    <Card>
      <CardHeader>
        <CardDescription>New signups</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{total}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-44 w-full">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

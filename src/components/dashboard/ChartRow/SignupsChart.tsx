import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts'

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
import type { SignupPoint } from '@/hooks/useOverviewData'

const chartConfig = {
  signups: { label: 'Signups', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function SignupsChart({ data }: { data: SignupPoint[] }) {
  const id = 'signups-chart'
  const [activeWeek, setActiveWeek] = React.useState(
    data[data.length - 1]?.week ?? '',
  )

  const weeks = React.useMemo(() => data.map((item) => item.week), [data])
  const activePoint = React.useMemo(
    () => data.find((item) => item.week === activeWeek),
    [data, activeWeek],
  )

  const activeCount = activePoint?.signups ?? 0

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="tabular-nums">{activeCount}</CardTitle>
          <CardDescription>New signups — {activeWeek}</CardDescription>
        </div>
        <Select value={activeWeek} onValueChange={setActiveWeek}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a week"
          >
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {weeks.map((key) => (
              <SelectItem
                key={key}
                value={key}
                className="rounded-lg [&_span]:flex"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: 'var(--color-signups)' }}
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
          <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="signups" fill="var(--color-signups)" radius={4}>
              {data.map((entry) => (
                <Cell
                  key={entry.week}
                  fillOpacity={entry.week === activeWeek ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

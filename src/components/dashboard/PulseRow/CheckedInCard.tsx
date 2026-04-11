import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PulseCheckedIn } from '@/hooks/useOverviewData'

export function CheckedInCard({ data }: { data: PulseCheckedIn }) {
  const max = Math.max(...data.sparkline, 1)
  const deltaPositive = data.delta >= 0

  return (
    <Card>
      <CardHeader>
        <CardDescription>Checked in today</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{data.count}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end gap-1 h-10" aria-hidden>
          {data.sparkline.map((value, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary/20"
              style={{ height: `${(value / max) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="size-3.5" aria-hidden />
          <span>
            {deltaPositive ? '+' : ''}
            {data.delta} vs yesterday
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

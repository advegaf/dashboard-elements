import { useState } from 'react'
import { useOverviewData } from '@/hooks/useOverviewData'
import { KpiStrip } from '@/components/dashboard/KpiStrip/KpiStrip'
import { ActionQueue } from '@/components/dashboard/ActionQueue/ActionQueue'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivity/RecentActivityFeed'
import { ChartRow } from '@/components/dashboard/ChartRow/ChartRow'
import { TimeRangePicker } from '@/components/dashboard/TimeRangePicker/TimeRangePicker'
import type { StatsTimeRange } from '@/lib/dashboard-aggregations'

export function DashboardPage() {
  const [range, setRange] = useState<StatsTimeRange>('30d')
  const data = useOverviewData(range)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">{data.dateRange}</p>
        </div>
        <TimeRangePicker value={range} onChange={setRange} />
      </div>

      <KpiStrip tiles={data.kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActionQueue rows={data.actionQueue} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed events={data.recentActivity} />
        </div>
      </div>

      <ChartRow
        revenueSeries={data.revenueSeries}
        signupSeries={data.signupSeries}
        revenueByPlan={data.revenueByPlan}
      />
    </div>
  )
}

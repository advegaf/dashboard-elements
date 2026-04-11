import { useState } from 'react'
import { useAuthContext } from '@/auth/AuthContext'
import { useOverviewData } from '@/hooks/useOverviewData'
import { KpiStrip } from '@/components/dashboard/KpiStrip/KpiStrip'
import { ActionQueue } from '@/components/dashboard/ActionQueue/ActionQueue'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivity/RecentActivityFeed'
import { ChartRow } from '@/components/dashboard/ChartRow/ChartRow'
import { TimeRangePicker } from '@/components/dashboard/TimeRangePicker/TimeRangePicker'
import { getActionCopy, getFirstName, getTimeGreeting } from '@/lib/dashboard-greeting'
import type { StatsTimeRange } from '@/lib/dashboard-aggregations'

export function DashboardPage() {
  const [range, setRange] = useState<StatsTimeRange>('30d')
  const data = useOverviewData(range)
  const { user, loading: authLoading } = useAuthContext()

  const firstName = getFirstName(user)
  const greeting =
    authLoading || !firstName
      ? 'Welcome back'
      : `${getTimeGreeting()}, ${firstName}`
  const subtitle = getActionCopy(data.actionQueue.length)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{greeting}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
        <TimeRangePicker value={range} onChange={setRange} />
      </div>

      <KpiStrip tiles={data.kpis} />

      <ChartRow
        revenueSeries={data.revenueSeries}
        signupSeries={data.signupSeries}
        revenueByPlan={data.revenueByPlan}
      />

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActionQueue rows={data.actionQueue} />
        </div>
        <div className="relative lg:col-span-1">
          <div className="lg:absolute lg:inset-0">
            <RecentActivityFeed events={data.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}

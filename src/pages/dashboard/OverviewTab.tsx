import type { StatsTimeRange } from '@/lib/dashboard-aggregations'
import { useOverviewData } from '@/hooks/useOverviewData'
import { ActionQueue } from '@/components/dashboard/ActionQueue/ActionQueue'
import { PulseRow } from '@/components/dashboard/PulseRow/PulseRow'

export function OverviewTab({ range }: { range: StatsTimeRange }) {
  const data = useOverviewData(range)

  return (
    <div className="flex flex-col gap-6">
      <ActionQueue rows={data.actionQueue} />
      <PulseRow
        checkedInToday={data.checkedInToday}
        newThisWeek={data.newThisWeek}
        recentActivity={data.recentActivity}
      />
    </div>
  )
}

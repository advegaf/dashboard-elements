import { CheckedInCard } from './CheckedInCard'
import { NewThisWeekCard } from './NewThisWeekCard'
import { RecentActivityFeed } from './RecentActivityFeed'
import type { ActivityEvent, PulseCheckedIn, PulseNewMember } from '@/hooks/useOverviewData'

interface PulseRowProps {
  checkedInToday: PulseCheckedIn
  newThisWeek: PulseNewMember
  recentActivity: ActivityEvent[]
}

export function PulseRow({ checkedInToday, newThisWeek, recentActivity }: PulseRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <CheckedInCard data={checkedInToday} />
      <NewThisWeekCard data={newThisWeek} />
      <RecentActivityFeed events={recentActivity} />
    </div>
  )
}

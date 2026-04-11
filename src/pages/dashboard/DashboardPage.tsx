import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeRangePicker } from '@/components/dashboard/TimeRangePicker/TimeRangePicker'
import { OverviewTab } from './OverviewTab'
import { AnalyticsTab } from './AnalyticsTab'
import type { StatsTimeRange } from '@/lib/dashboard-aggregations'

export function DashboardPage() {
  const [range, setRange] = useState<StatsTimeRange>('30d')

  return (
    <div className="flex flex-col gap-6 p-6">
      <Tabs defaultValue="overview" className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TimeRangePicker value={range} onChange={setRange} />
        </div>
        <TabsContent value="overview" className="mt-0">
          <OverviewTab range={range} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-0">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

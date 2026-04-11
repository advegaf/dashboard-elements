import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { PulseNewMember } from '@/hooks/useOverviewData'

export function NewThisWeekCard({ data }: { data: PulseNewMember }) {
  const deltaPositive = data.delta >= 0

  return (
    <Card>
      <CardHeader>
        <CardDescription>New this week</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{data.count}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center -space-x-2">
          {data.recentInitials.map((initials, i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          ))}
          {data.recentInitials.length < data.count && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
              +{data.count - data.recentInitials.length}
            </div>
          )}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {deltaPositive ? '+' : ''}
          {data.delta} vs last week
        </div>
      </CardContent>
    </Card>
  )
}

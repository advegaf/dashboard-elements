import { useMemo, useState } from 'react'
import { Avatar, AvatarBadge, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/lib/utils'
import type { ActivityEvent, ActivityEventType } from '@/hooks/useOverviewData'

type FilterValue = ActivityEventType | 'all'

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: 'All',        value: 'all' },
  { label: 'Check-ins',  value: 'check-in' },
  { label: 'Signups',    value: 'signup' },
  { label: 'Payments',   value: 'payment' },
  { label: 'Missed',     value: 'missed' },
]

const typeDotClass: Record<ActivityEventType, string> = {
  'check-in': 'bg-success',
  'signup':   'bg-info',
  'payment':  'bg-success',
  'missed':   'bg-destructive',
}

export function RecentActivityFeed({ events }: { events: ActivityEvent[] }) {
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? events : events.filter((event) => event.type === filter)),
    [events, filter],
  )

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardAction>
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterValue)}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-0 pb-0">
        <ScrollArea className="h-full">
          <ul className="px-6 pb-6">
            {filtered.length === 0 ? (
              <li className="py-12 text-center text-sm text-muted-foreground">
                No recent activity.
              </li>
            ) : (
              filtered.map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <Avatar size="sm">
                    <AvatarFallback>{getInitials(event.memberName)}</AvatarFallback>
                    <AvatarBadge className={typeDotClass[event.type]} aria-hidden />
                  </Avatar>
                  <span className="flex-1 truncate">
                    <span className="font-medium">{event.memberName}</span>{' '}
                    <span className="text-muted-foreground">{event.description}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {event.time}
                  </span>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ActivityEvent, ActivityEventType } from '@/hooks/useOverviewData'

const typeDotClass: Record<ActivityEventType, string> = {
  'check-in': 'bg-emerald-500',
  'signup':   'bg-blue-500',
  'payment':  'bg-amber-500',
  'missed':   'bg-rose-500',
}

export function RecentActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardDescription>Recent activity</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0 pb-0">
        <ScrollArea className="h-48">
          <ul className="px-6 pb-4">
            {events.map((event) => (
              <li key={event.id} className="flex items-center gap-3 py-2 text-sm">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${typeDotClass[event.type]}`}
                  aria-hidden
                />
                <span className="flex-1 truncate">
                  <span className="font-medium">{event.memberName}</span>{' '}
                  <span className="text-muted-foreground">{event.description}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {event.time}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

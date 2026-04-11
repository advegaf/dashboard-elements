import { HugeiconsIcon } from '@hugeicons/react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { KpiTile } from '@/hooks/useOverviewData'

export function KpiStrip({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {tiles.map((tile) => (
        <Card
          key={tile.label}
          className="kpi-dots rounded-2xl bg-muted py-3 shadow-none"
        >
          <CardContent className="flex h-full flex-col gap-3 px-3">
            <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">
                {tile.label}
              </span>
              <span className="text-3xl font-semibold leading-none">
                {tile.value}
              </span>
              <span className="text-muted-foreground text-sm">
                {tile.subDescription}
              </span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 px-1 text-xs">
              <HugeiconsIcon
                icon={tile.icon}
                strokeWidth={2}
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span
                className={cn(
                  'truncate',
                  tile.positive ? 'text-success' : 'text-destructive',
                )}
              >
                {tile.delta}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

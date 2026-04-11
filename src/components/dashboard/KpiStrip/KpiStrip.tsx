import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { KpiTile } from '@/hooks/useOverviewData'

export function KpiStrip({ tiles }: { tiles: KpiTile[] }) {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-6 px-6 py-5 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile, index) => (
          <div
            key={tile.label}
            className={cn(
              'flex flex-col gap-1',
              index > 0 && 'lg:border-l lg:pl-6',
            )}
          >
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {tile.label}
            </span>
            <span className="text-3xl font-semibold tabular-nums">{tile.value}</span>
            <span
              className={cn(
                'text-xs tabular-nums',
                tile.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {tile.positive ? '▲' : '▼'} {tile.delta}{' '}
              <span className="text-muted-foreground">vs last period</span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

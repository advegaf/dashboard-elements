import { Card, CardContent } from '@/components/ui/card'
import type { KpiTile } from '@/hooks/useOverviewData'

export function KpiStrip({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <Card key={tile.label}>
            <CardContent className="flex h-full flex-col gap-3 px-5 py-5">
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium tracking-wide">
                  {tile.label}
                </span>
                <span className="text-3xl font-semibold tabular-nums leading-none">
                  {tile.value}
                </span>
                <span className="text-muted-foreground text-sm">
                  {tile.subDescription}
                </span>
              </div>
              <div className="mt-auto border-t pt-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate tabular-nums">{tile.delta}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

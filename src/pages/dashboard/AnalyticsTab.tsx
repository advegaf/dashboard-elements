import { Card, CardContent } from '@/components/ui/card'

export function AnalyticsTab() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-base font-medium">Analytics landing in PR #2.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          MRR · Active members · New this period · Retention % · ARPU strip, plus revenue trend
          · signups · revenue by plan charts. Shipping right after the Overview tab is merged.
        </p>
      </CardContent>
    </Card>
  )
}

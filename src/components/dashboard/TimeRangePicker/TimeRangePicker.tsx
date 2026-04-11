import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { StatsTimeRange } from '@/lib/dashboard-aggregations'

const presets: { label: string; value: StatsTimeRange }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'All', value: 'all' },
]

interface TimeRangePickerProps {
  value: StatsTimeRange
  onChange: (value: StatsTimeRange) => void
  className?: string
}

export function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border bg-background p-0.5',
        className,
      )}
      role="group"
      aria-label="Time range"
    >
      {presets.map((preset) => {
        const isActive = value === preset.value
        return (
          <Button
            key={preset.value}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(preset.value)}
            className="h-7 px-3 text-xs font-medium"
            aria-pressed={isActive}
          >
            {preset.label}
          </Button>
        )
      })}
    </div>
  )
}

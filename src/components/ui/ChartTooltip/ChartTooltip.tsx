import { colors } from '../../../styles/colors'

interface ChartTooltipProps {
  active?: boolean
  payload?: { value: number; dataKey?: string }[]
  label?: string
  formatter: (value: number, payload: { value: number; dataKey?: string }[], label: string) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'oklch(0 0 0 / 0.75)',
        backdropFilter: 'blur(12px)',
        borderRadius: 8,
        padding: '6px 10px',
        color: colors.text,
        fontSize: 12,
        fontWeight: 500,
        border: `1px solid ${colors.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {formatter(payload[0].value, payload, label ?? '')}
    </div>
  )
}

interface GlowOptions {
  trend?: { value: number; direction: 'up' | 'down' }
  inverted?: boolean
  loading?: boolean
  error?: boolean
}

export function getGlowColor({ trend, inverted = false, loading, error }: GlowOptions): string {
  if (loading) return 'var(--gray-9)'
  if (error) return 'var(--color-danger)'
  if (!trend) return 'var(--gray-9)'

  const isGood = inverted
    ? trend.direction === 'down'
    : trend.direction === 'up'

  if (isGood) return 'var(--color-success)'
  return trend.value >= 5 ? 'var(--color-danger)' : 'var(--color-urgency)'
}

import { MrrChart } from './MrrChart'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import { getGlowColor } from '../../utils/glow'
import type { RevenueBucket } from '../../lib/dashboard-aggregations'
import styles from './MrrCard.module.css'

interface MrrCardProps {
  data: RevenueBucket[]
  value: string
  trend?: { value: number; direction: 'up' | 'down' }
  dateRange: string
  loading?: boolean
  error?: Error
}

export function MrrCard({ data, value, trend, dateRange, loading, error }: MrrCardProps) {
  const hasData = data.some(d => d.revenue > 0)
  const glowColor = getGlowColor({ trend, loading, error: !!error })

  return (
    <div className={styles.card} style={{ '--glow-color': glowColor } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>MRR</h2>
        <p className={styles.subtitle}>{dateRange}</p>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          {loading ? (
            <>
              <Skeleton width={80} height={32} />
              <Skeleton width={50} height={16} />
            </>
          ) : error ? (
            <div className={styles.bigNumber} style={{ color: 'var(--color-danger)', fontSize: 14 }}>Failed to load</div>
          ) : (
            <>
              <div className={styles.bigNumber}>{value}</div>
              {trend && (
                <div className={styles.change}>
                  {trend.direction === 'up' ? '\u25B2' : '\u25BC'} {trend.direction === 'up' ? '+' : ''}{trend.value}%
                </div>
              )}
            </>
          )}
        </div>
        <div className={styles.chartWrapper}>
          {loading ? (
            <Skeleton width="100%" height={80} borderRadius={8} />
          ) : !error && hasData ? (
            <MrrChart data={data} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

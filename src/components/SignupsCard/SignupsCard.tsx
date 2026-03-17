import { SignupsChart } from './SignupsChart'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import { getGlowColor } from '../../utils/glow'
import type { SignupBucket } from '../../lib/dashboard-aggregations'
import styles from './SignupsCard.module.css'

interface SignupsCardProps {
  data: SignupBucket[]
  total: string
  trend?: { value: number; direction: 'up' | 'down' }
  dateRange: string
  loading?: boolean
  error?: Error
}

export function SignupsCard({ data, total, trend, dateRange, loading, error }: SignupsCardProps) {
  const glowColor = getGlowColor({ trend, loading, error: !!error })

  return (
    <div className={styles.card} style={{ '--glow-color': glowColor } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Member Sign-ups</h2>
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
              <div className={styles.bigNumber}>{total}</div>
              <div className={styles.unit}>members</div>
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
          ) : !error ? (
            <SignupsChart data={data} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

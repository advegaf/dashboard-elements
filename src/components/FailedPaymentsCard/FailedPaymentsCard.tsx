import { CreditCard } from '../shared-assets/credit-card/CreditCard'
import { SummaryTable } from '../SummaryTable/SummaryTable'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import { getGlowColor } from '../../utils/glow'
import { colors } from '../../styles/colors'
import type { FailedPaymentData } from '../../lib/dashboard-aggregations'
import styles from './FailedPaymentsCard.module.css'

const REASON_COLORS = [colors.danger, colors.urgency, colors.warning, colors.neutral]

interface FailedPaymentsCardProps {
  data: FailedPaymentData
  dateRange: string
  loading?: boolean
  error?: Error
}

export function FailedPaymentsCard({ data, dateRange, loading, error }: FailedPaymentsCardProps) {
  const glowColor = getGlowColor({ trend: data.trend, inverted: true, loading, error: !!error })
  const hasFailures = data.totalCount > 0
  const heroColor = hasFailures ? 'var(--color-text)' : 'var(--color-success)'

  // For failed payments, up = bad (red), down = good (green)
  const trendLabel = data.trend
    ? `${data.trend.direction === 'up' ? '\u25B2' : '\u25BC'} ${data.trend.direction === 'up' ? '+' : '-'}${data.trend.value}%`
    : null
  const trendClass = data.trend
    ? data.trend.direction === 'up' ? styles.trendBad : styles.trendGood
    : ''

  const summaryRows = data.rows.map(r => ({
    label: r.label,
    value: r.amount,
    change: `${r.count}`,
    positive: false,
  }))

  return (
    <div className={styles.card} style={{ '--glow-color': glowColor } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Failed Payments</h2>
        <p className={styles.subtitle}>{dateRange}</p>
      </div>

      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <Skeleton width="40%" height={32} borderRadius={8} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="60%" height={16} borderRadius={6} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={140} borderRadius={12} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={80} borderRadius={8} />
          </div>
        </div>
      ) : error ? (
        <p className={styles.description} style={{ color: 'var(--color-danger)' }}>
          Failed to load payment data.
        </p>
      ) : (
        <>
          <div>
            <div className={styles.heroValue} style={{ color: heroColor }}>
              {data.totalAmount}
            </div>
            <div className={styles.heroLabel}>
              <span>at risk from {data.totalCount} failed payment{data.totalCount !== 1 ? 's' : ''}</span>
              {trendLabel && (
                <span className={`${styles.heroTrend} ${trendClass}`}>{trendLabel}</span>
              )}
            </div>
          </div>

          <div className={styles.visualWrapper}>
            <CreditCard type="transparent" />
          </div>

          {hasFailures ? (
            <SummaryTable
              rows={summaryRows}
              className={styles.summaryTableSpacing}
              colors={REASON_COLORS}
            />
          ) : (
            <p className={styles.emptyMessage}>No failed payments</p>
          )}
        </>
      )}
    </div>
  )
}

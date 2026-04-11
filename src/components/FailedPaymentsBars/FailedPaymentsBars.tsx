import { SummaryTable } from '../SummaryTable/SummaryTable'
import type { FailedPaymentSummary } from '../../lib/dashboard-aggregations'
import styles from './FailedPaymentsBars.module.css'

interface FailedPaymentsBarsProps {
  totalAmount: string
  totalCount: number
  trend?: { value: number; direction: 'up' | 'down' }
  rows: FailedPaymentSummary[]
  colors: string[]
}

export function FailedPaymentsBars({ totalAmount, totalCount, trend, rows, colors }: FailedPaymentsBarsProps) {
  const trendLabel = trend
    ? `${trend.direction === 'up' ? '\u25B2' : '\u25BC'} ${trend.direction === 'up' ? '+' : '-'}${trend.value}%`
    : null
  const trendClass = trend
    ? trend.direction === 'up' ? styles.trendBad : styles.trendGood
    : ''

  const summaryRows = rows.map(r => ({
    label: r.label,
    value: r.amount,
    change: `${r.count}`,
    positive: false,
  }))

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.heroValue}>{totalAmount}</div>
        <div className={styles.heroLabel}>
          <span>at risk from {totalCount} failed payment{totalCount !== 1 ? 's' : ''}</span>
          {trendLabel && (
            <span className={`${styles.heroTrend} ${trendClass}`}>{trendLabel}</span>
          )}
        </div>
      </div>
      <SummaryTable rows={summaryRows} colors={colors} />
    </div>
  )
}

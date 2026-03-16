import { SalesChart } from './SalesChart'
import { SummaryTable } from './SummaryTable'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import type { RevenueBucket, SummaryRow } from '../../lib/dashboard-aggregations'
import styles from './SalesCard.module.css'

interface SalesCardProps {
  data: RevenueBucket[]
  summary: SummaryRow[]
  dateRange: string
  loading?: boolean
  error?: Error
}

export function SalesCard({ data, summary, dateRange, loading, error }: SalesCardProps) {
  const hasData = data.some(d => d.revenue > 0)

  return (
    <div className={styles.card} style={{ '--glow': '34, 197, 94' } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <div>
          <h2 className={styles.title}>Gym Revenue</h2>
          <p className={styles.subtitle}>{dateRange}</p>
        </div>
      </div>

      <p className={styles.description}>
        This month gym revenue has grown by{' '}
        <strong>13.5%</strong> compared with last month's 4.5%, driven by
        new memberships and personal training packages.
      </p>

      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <Skeleton width="100%" height={220} borderRadius={8} />
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={60} borderRadius={8} />
          </div>
        </div>
      ) : error ? (
        <p className={styles.description} style={{ color: '#FF9592' }}>
          Failed to load revenue data.
        </p>
      ) : !hasData ? (
        <p className={styles.description}>
          No revenue data yet. Revenue will appear here once payment processing is connected.
        </p>
      ) : (
        <>
          <SalesChart data={data} />
          <SummaryTable rows={summary} />
        </>
      )}
    </div>
  )
}

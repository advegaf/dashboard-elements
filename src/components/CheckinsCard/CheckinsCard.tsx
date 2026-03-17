import { CheckinsHeatmap } from './CheckinsHeatmap'
import { SummaryTable } from '../SummaryTable/SummaryTable'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import type { SummaryRow } from '../../lib/dashboard-aggregations'
import styles from './CheckinsCard.module.css'

interface CheckinsCardProps {
  heatmapData: number[][]
  summaryRows: SummaryRow[]
  dateRange: string
  loading?: boolean
  error?: Error
}

export function CheckinsCard({ heatmapData, summaryRows, dateRange, loading, error }: CheckinsCardProps) {
  return (
    <div className={styles.card} style={{ '--glow-color': 'var(--gray-9)' } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Member Check-ins</h2>
        <p className={styles.subtitle}>{dateRange}</p>
      </div>
      <p className={styles.description}>
        Peak activity is between <strong>5-7 PM</strong> on weekdays, with Tuesday and
        Thursday drawing the most members. Morning sessions are trending up{' '}
        <strong>8.2%</strong> this month.
      </p>
      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <Skeleton width="80%" height={12} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="55%" height={12} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={140} borderRadius={8} />
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Skeleton width={80} height={12} />
                <div style={{ marginLeft: 'auto' }}>
                  <Skeleton width={50} height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <p className={styles.description} style={{ color: 'var(--color-danger)' }}>
          Failed to load check-in data.
        </p>
      ) : (
        <>
          <div className={styles.chartWrapper}>
            <CheckinsHeatmap data={heatmapData} />
          </div>
          <SummaryTable rows={summaryRows} className={styles.summaryTableSpacing} />
        </>
      )}
    </div>
  )
}

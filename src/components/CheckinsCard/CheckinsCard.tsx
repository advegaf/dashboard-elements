import { CheckinsHeatmap } from './CheckinsHeatmap'
import { CheckinsSummaryTable } from './CheckinsSummaryTable'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import type { CheckinPeriodRow } from '../../lib/dashboard-aggregations'
import styles from './CheckinsCard.module.css'

interface CheckinsCardProps {
  heatmapData: number[][]
  summaryRows: CheckinPeriodRow[]
  dateRange: string
  loading?: boolean
  error?: Error
}

export function CheckinsCard({ heatmapData, summaryRows, dateRange, loading, error }: CheckinsCardProps) {
  return (
    <div className={styles.card} style={{ '--glow': '34, 197, 94' } as React.CSSProperties}>
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
          <Skeleton width="100%" height={180} borderRadius={8} />
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={60} borderRadius={8} />
          </div>
        </div>
      ) : error ? (
        <p className={styles.description} style={{ color: '#FF9592' }}>
          Failed to load check-in data.
        </p>
      ) : (
        <>
          <div className={styles.chartWrapper}>
            <CheckinsHeatmap data={heatmapData} />
          </div>
          <CheckinsSummaryTable rows={summaryRows} />
        </>
      )}
    </div>
  )
}

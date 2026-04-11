import { Skeleton } from '../ui/Skeleton/Skeleton'
import styles from '../../pages/DashboardPage/DashboardPage.module.css'

interface WidgetBodyLayoutProps {
  title: string
  subtitle: string
  trend?: { label: string; direction: 'up' | 'down' }
  loading?: boolean
  error?: string
  children: React.ReactNode
}

export function WidgetBodyLayout({ title, subtitle, trend, loading, error, children }: WidgetBodyLayoutProps) {
  return (
    <div>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>{title}</div>
        {loading ? (
          <Skeleton width={120} height={28} />
        ) : (
          <div className={styles.chartTrend}>
            <span className={styles.chartPeriod}>{subtitle}</span>
            {trend && (
              <span className={styles.chartTrendBadge} data-direction={trend.direction}>
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {error ? (
        <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>
      ) : loading ? (
        <div className={styles.chartArea}>
          <Skeleton width="100%" height="100%" />
        </div>
      ) : (
        <div className={styles.chartArea}>
          {children}
        </div>
      )}
    </div>
  )
}

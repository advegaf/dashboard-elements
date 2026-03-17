import { Skeleton } from '../ui/Skeleton/Skeleton'
import { getGlowColor } from '../../utils/glow'
import { colors } from '../../styles/colors'
import type { ChurnRiskData } from '../../lib/dashboard-aggregations'
import styles from './ChurnRiskCard.module.css'

interface ChurnRiskCardProps {
  data: ChurnRiskData | null
  dateRange: string
  loading?: boolean
}

const tierColors = {
  critical: colors.danger,
  high: colors.urgency,
  medium: colors.warning,
}

export function ChurnRiskCard({ data, dateRange, loading }: ChurnRiskCardProps) {
  const glowColor = getGlowColor({ trend: data?.trend, inverted: true, loading })

  return (
    <div className={styles.card} style={{ '--glow-color': glowColor } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Churn Risk</h2>
        <p className={styles.subtitle}>{dateRange}</p>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          {loading ? (
            <>
              <Skeleton width={80} height={32} />
              <Skeleton width={50} height={16} />
            </>
          ) : (
            <>
              <div className={styles.bigNumber}>{data?.total ?? '—'}</div>
              <div className={styles.unit}>members</div>
              {data?.trend && (
                <div className={styles.change} data-direction={data.trend.direction}>
                  {data.trend.direction === 'up' ? '▲' : '▼'} {data.trend.direction === 'up' ? '+' : ''}{data.trend.value}%
                </div>
              )}
            </>
          )}
        </div>
        <div className={styles.vizWrapper}>
          {loading ? (
            <Skeleton width="100%" height={80} borderRadius={8} />
          ) : data && (
            <>
              <div className={styles.barContainer}>
                {data.critical > 0 && (
                  <div
                    className={styles.barSegment}
                    style={{ flex: data.critical, backgroundColor: tierColors.critical }}
                  />
                )}
                {data.high > 0 && (
                  <div
                    className={styles.barSegment}
                    style={{ flex: data.high, backgroundColor: tierColors.high }}
                  />
                )}
                {data.medium > 0 && (
                  <div
                    className={styles.barSegment}
                    style={{ flex: data.medium, backgroundColor: tierColors.medium }}
                  />
                )}
              </div>
              <div className={styles.tierLabels}>
                <span style={{ color: tierColors.critical }}>{data.critical} crit</span>
                <span style={{ color: tierColors.high }}>{data.high} high</span>
                <span style={{ color: tierColors.medium }}>{data.medium} med</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

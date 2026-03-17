import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import { colors } from '../../styles/colors'
import styles from './KpiCard.module.css'

interface KpiCardProps {
  title: string
  value: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  sparklineData?: number[]
  sparklineColor?: string
  glowColor?: string
  loading?: boolean
}

export function KpiCard({ title, value, trend, sparklineData, sparklineColor = colors.success, glowColor, loading }: KpiCardProps) {
  const chartData = sparklineData?.map((v, i) => ({ i, v }))

  return (
    <div className={styles.card} style={{ '--glow-color': glowColor ?? 'var(--color-success)' } as React.CSSProperties}>
      <div className={styles.top}>
        <span className={styles.title}>{title}</span>
        {!loading && chartData && (
          <div className={styles.sparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={sparklineColor}
                  strokeWidth={1.5}
                  fill={`url(#spark-${title})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {loading ? (
        <>
          <Skeleton width="60%" height={28} />
          <div style={{ marginTop: 6 }}>
            <Skeleton width="40%" height={14} borderRadius={4} />
          </div>
        </>
      ) : (
        <>
          <div className={styles.value}>{value}</div>
          {trend && (
            <div className={styles.trend} data-direction={trend.direction}>
              <span className={styles.arrow}>{trend.direction === 'up' ? '\u25B2' : '\u25BC'}</span>
              {trend.direction === 'up' ? '+' : ''}{trend.value}%
            </div>
          )}
        </>
      )}
    </div>
  )
}

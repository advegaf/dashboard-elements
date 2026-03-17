import { useState } from 'react'
import { SalesChart } from './SalesChart'
import { SummaryTable } from '../SummaryTable/SummaryTable'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import { colors } from '../../styles/colors'
import { toSummaryRows, type RevenueSlice } from '../../lib/dashboard-aggregations'
import styles from './SalesCard.module.css'

const SLICE_COLORS = [colors.success, colors.info, colors.warning]

interface SalesCardProps {
  data: RevenueSlice[]
  dateRange: string
  loading?: boolean
  error?: Error
}

export function SalesCard({ data, dateRange, loading, error }: SalesCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const hasData = data.some(s => s.value > 0)

  const totalCents = data.reduce((sum, s) => sum + s.value, 0)
  const total = `$${(totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const summaryRows = toSummaryRows(data)

  const topSlice = hasData ? [...data].sort((a, b) => b.value - a.value)[0] : null
  const topPct = topSlice && totalCents > 0 ? Math.round((topSlice.value / totalCents) * 100) : 0

  return (
    <div className={styles.card} style={{ '--glow-color': 'var(--gray-9)' } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <div>
          <h2 className={styles.title}>Revenue Breakdown</h2>
          <p className={styles.subtitle}>{dateRange}</p>
        </div>
      </div>

      {!loading && !error && topSlice && (
        <p className={styles.description}>
          Revenue split across <strong>{data.length}</strong> categories.{' '}
          <strong>{topSlice.label}</strong> leads at <strong>{topSlice.formatted}</strong> ({topPct}% of total).
        </p>
      )}

      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <Skeleton width="80%" height={12} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="60%" height={12} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={180} borderRadius={8} />
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Skeleton width={10} height={10} borderRadius="50%" />
                <Skeleton width={80} height={12} />
                <div style={{ marginLeft: 'auto' }}>
                  <Skeleton width={60} height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <p className={styles.description} style={{ color: 'var(--color-danger)' }}>
          Failed to load revenue data.
        </p>
      ) : !hasData ? (
        <p className={styles.description}>
          No revenue data yet. Revenue will appear here once payment processing is connected.
        </p>
      ) : (
        <>
          <SalesChart
            data={data}
            colors={SLICE_COLORS}
            total={total}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
          />
          <SummaryTable
            rows={summaryRows}
            className={styles.summaryTableSpacing}
            colors={SLICE_COLORS}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
          />
        </>
      )}
    </div>
  )
}

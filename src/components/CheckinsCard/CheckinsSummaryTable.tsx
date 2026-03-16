import type { CheckinPeriodRow } from '../../lib/dashboard-aggregations'
import styles from './CheckinsCard.module.css'

interface CheckinsSummaryTableProps {
  rows: CheckinPeriodRow[]
}

export function CheckinsSummaryTable({ rows }: CheckinsSummaryTableProps) {
  if (rows.length === 0) return null

  return (
    <div className={styles.summaryTable}>
      {rows.map((row) => (
        <div key={row.label} className={styles.summaryRow}>
          <div className={styles.rowLeft}>
            <span className={styles.rowLabel}>{row.label}</span>
            <span className={styles.rowValue}>{row.value}</span>
          </div>
          <div className={styles.rowRight}>
            <span className={styles.rowChange}>
              {row.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

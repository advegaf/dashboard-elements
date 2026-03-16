import type { SummaryRow } from '../../lib/dashboard-aggregations'
import styles from './SalesCard.module.css'

interface SummaryTableProps {
  rows: SummaryRow[]
}

export function SummaryTable({ rows }: SummaryTableProps) {
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

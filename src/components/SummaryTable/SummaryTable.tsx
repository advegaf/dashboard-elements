import type { SummaryRow } from '../../lib/dashboard-aggregations'
import styles from './SummaryTable.module.css'

interface SummaryTableProps {
  rows: SummaryRow[]
  className?: string
  colors?: string[]
  activeIndex?: number | null
  onHover?: (index: number | null) => void
}

export function SummaryTable({ rows, className, colors, activeIndex, onHover }: SummaryTableProps) {
  if (rows.length === 0) return null

  return (
    <div className={`${styles.summaryTable}${className ? ` ${className}` : ''}`}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`${styles.summaryRow}${activeIndex === i ? ` ${styles.rowHighlight}` : ''}`}
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(null)}
        >
          <div className={styles.rowLeft}>
            {colors && (
              <span
                className={styles.colorDot}
                style={{ backgroundColor: colors[i % colors.length] }}
              />
            )}
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

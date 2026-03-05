import styles from './SalesCard.module.css'

function glowFromHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `0 0 8px rgba(${r}, ${g}, ${b}, 0.6), 0 0 4px rgba(${r}, ${g}, ${b}, 0.3)`
}

const rows = [
  {
    label: 'Memberships',
    value: '$14,567.09',
    change: '+5.4%/mth',
    positive: true,
    barColor: '#34d399',
    fillPercent: 35,
  },
  {
    label: 'Personal Training',
    value: '$11,457.00',
    change: '+3.6%/mth',
    positive: true,
    barColor: '#818cf8',
    fillPercent: 78,
  },
  {
    label: 'Retail & Merch',
    value: '$3,789.00',
    change: '-4.0%/mth',
    positive: false,
    barColor: '#f59e0b',
    fillPercent: 55,
  },
]

export function SummaryTable() {
  return (
    <div className={styles.summaryTable}>
      {rows.map((row) => (
        <div key={row.label} className={styles.summaryRow}>
          <div className={styles.rowLeft}>
            <span className={styles.rowLabel}>{row.label}</span>
            <span className={styles.rowValue}>{row.value}</span>
          </div>
          <div className={styles.rowRight}>
            <span
              className={styles.rowChange}
            >
              {row.change}
            </span>
            <span className={styles.progressTrack}>
              <span
                className={styles.progressFill}
                style={{ width: `${row.fillPercent}%`, backgroundColor: row.barColor, boxShadow: glowFromHex(row.barColor) }}
              />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

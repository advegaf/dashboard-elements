import { SalesChart } from './SalesChart'
import { SummaryTable } from './SummaryTable'
import styles from './SalesCard.module.css'

export function SalesCard() {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <div>
          <h2 className={styles.title}>Gym Revenue</h2>
          <p className={styles.subtitle}>Feb 5th - Mar 5th</p>
        </div>
      </div>

      <p className={styles.description}>
        This month gym revenue has grown by{' '}
        <strong>13.5%</strong> compared with last month's 4.5%, driven by
        new memberships and personal training packages.
      </p>

      <SalesChart />
      <SummaryTable />
    </div>
  )
}

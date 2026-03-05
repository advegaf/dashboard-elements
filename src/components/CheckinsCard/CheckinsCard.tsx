import { CheckinsHeatmap } from './CheckinsHeatmap'
import styles from './CheckinsCard.module.css'

export function CheckinsCard() {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Member Check-ins</h2>
        <p className={styles.subtitle}>Feb 5th - Mar 5th</p>
      </div>
      <div className={styles.stats}>
        <div className={styles.bigNumber}>4,156</div>
        <div className={styles.change}>&#9650; 15.3% from last month</div>
      </div>
      <div className={styles.chartWrapper}>
        <CheckinsHeatmap />
      </div>
    </div>
  )
}

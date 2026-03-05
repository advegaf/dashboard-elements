import { SignupsChart } from './SignupsChart'
import styles from './SignupsCard.module.css'

export function SignupsCard() {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Member Sign-ups</h2>
        <p className={styles.subtitle}>Feb 5th - Mar 5th</p>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          <div className={styles.bigNumber}>1,247</div>
          <div className={styles.change}>&#9650; 12.5% from last month</div>
        </div>
        <div className={styles.chartWrapper}>
          <SignupsChart />
        </div>
      </div>
    </div>
  )
}

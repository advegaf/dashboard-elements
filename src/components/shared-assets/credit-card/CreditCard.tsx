import styles from './CreditCard.module.css'

interface CreditCardProps {
  type?: 'transparent'
  holderName?: string
}

export function CreditCard({ holderName = 'LEDGR MEMBER' }: CreditCardProps) {
  return (
    <div className={styles.creditCard}>
      <div className={styles.brandRow}>
        <span className={styles.brand}>LEDGR</span>
      </div>
      <div className={styles.middle}>
        <div className={styles.chip} />
      </div>
      <div className={styles.bottom}>
        <div className={styles.dots}>
          {Array.from({ length: 3 }, (_, g) => (
            <div key={g} className={styles.dotGroup}>
              {Array.from({ length: 4 }, (_, d) => (
                <span key={d} className={styles.dot} />
              ))}
            </div>
          ))}
          <span className={styles.lastFour}>4242</span>
        </div>
        <div className={styles.bottomInfo}>
          <span className={styles.cardholder}>{holderName}</span>
          <div className={styles.meta}>
            <span className={styles.metaLabel}>Valid Thru</span>
            <span className={styles.metaValue}>12/28</span>
          </div>
          <div className={styles.networkLogo}>
            <span className={styles.networkCircle} />
            <span className={styles.networkCircle} />
          </div>
        </div>
      </div>
    </div>
  )
}

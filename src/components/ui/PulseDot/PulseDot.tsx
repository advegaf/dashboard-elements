import { colors } from '../../../styles/colors'
import styles from './PulseDot.module.css'

export function PulseDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={colors.success} stroke={colors.text} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={4} fill="none" stroke={colors.success} className={styles.pulseRing} />
    </g>
  )
}

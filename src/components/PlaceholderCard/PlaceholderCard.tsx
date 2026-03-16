import styles from './PlaceholderCard.module.css'

export function PlaceholderCard() {
  return (
    <div className={styles.card} style={{ '--glow': '148, 163, 184' } as React.CSSProperties} />
  )
}

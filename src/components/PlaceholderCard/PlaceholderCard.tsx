import styles from './PlaceholderCard.module.css'

export function PlaceholderCard() {
  return (
    <div className={styles.card} style={{ '--glow-color': 'var(--gray-9)' } as React.CSSProperties} />
  )
}

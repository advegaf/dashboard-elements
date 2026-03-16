import styles from './Skeleton.module.css'

interface Props {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

export function Skeleton({ width, height = 14, borderRadius, className }: Props) {
  return (
    <div
      className={className ? `${styles.skeleton} ${className}` : styles.skeleton}
      style={{ width, height, borderRadius }}
    />
  )
}

import { type SVGProps, useState } from 'react'
import styles from './animated-mic.module.css'

export function AnimatedMic(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props
  const [hovered, setHovered] = useState(false)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      <rect
        key={hovered ? 'animating' : 'idle'}
        className={hovered ? styles.micCapsuleAnimate : undefined}
        x="9" y="2" width="6" height="11" rx="3"
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

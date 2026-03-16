import { type SVGProps, useState } from 'react'

export function AnimatedPlus(props: SVGProps<SVGSVGElement> & { size?: number }) {
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
      <line
        x1="12" y1="5" x2="12" y2="19"
        style={{
          transition: 'transform 0.3s ease',
          transformOrigin: 'center',
          transform: hovered ? 'rotate(90deg)' : 'none',
        }}
      />
      <line
        x1="5" y1="12" x2="19" y2="12"
        style={{
          transition: 'transform 0.3s ease',
          transformOrigin: 'center',
          transform: hovered ? 'rotate(90deg)' : 'none',
        }}
      />
    </svg>
  )
}

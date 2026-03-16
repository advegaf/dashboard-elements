import { type SVGProps, useState, useId } from 'react'

export function AnimatedAudioLines(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props
  const [hovered, setHovered] = useState(false)
  const id = useId()

  const bars = [
    { x: 2, heights: [2, 10, 6, 2], delay: '0s' },
    { x: 6, heights: [6, 2, 10, 6], delay: '0.15s' },
    { x: 10, heights: [10, 6, 2, 10], delay: '0.3s' },
    { x: 14, heights: [6, 10, 6, 2], delay: '0.1s' },
    { x: 18, heights: [2, 6, 10, 2], delay: '0.25s' },
  ]

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
      {bars.map((bar, i) => {
        const baseHalf = bar.heights[0] / 2
        return (
          <line
            key={`${id}-${i}`}
            x1={bar.x + 2}
            x2={bar.x + 2}
            y1={12 - baseHalf}
            y2={12 + baseHalf}
          >
            {hovered && (
              <>
                <animate
                  attributeName="y1"
                  values={bar.heights.map(h => String(12 - h / 2)).join(';')}
                  dur="0.8s"
                  begin={bar.delay}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y2"
                  values={bar.heights.map(h => String(12 + h / 2)).join(';')}
                  dur="0.8s"
                  begin={bar.delay}
                  repeatCount="indefinite"
                />
              </>
            )}
          </line>
        )
      })}
    </svg>
  )
}

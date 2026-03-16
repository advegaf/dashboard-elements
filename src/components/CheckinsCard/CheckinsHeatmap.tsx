import { useState, useRef } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function formatHour(h: number) {
  if (h === 0) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

const LABEL_WIDTH = 16
const LABEL_HEIGHT = 16
const CELL_W = 13
const CELL_H = 16
const GAP = 2
const COLS = 24
const ROWS = 7

const svgWidth = LABEL_WIDTH + COLS * (CELL_W + GAP) + LABEL_WIDTH
const svgHeight = ROWS * (CELL_H + GAP) + LABEL_HEIGHT

interface CheckinsHeatmapProps {
  data: number[][]
}

export function CheckinsHeatmap({ data }: CheckinsHeatmapProps) {
  const [hovered, setHovered] = useState<{
    day: number
    hour: number
    x: number
    y: number
  } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const maxValue = Math.max(...data.flat(), 1)

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block' }}
      >
        {/* Day labels */}
        {DAY_LABELS.map((label, row) => (
          <text
            key={`day-${row}`}
            x={LABEL_WIDTH / 2}
            y={row * (CELL_H + GAP) + CELL_H / 2 + 4}
            fill="rgba(255,255,255,0.4)"
            fontSize={9}
            fontWeight={500}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Hour labels */}
        {[0, 4, 8, 12, 16, 20].map((hour) => (
          <text
            key={`hour-${hour}`}
            x={LABEL_WIDTH + hour * (CELL_W + GAP) + CELL_W / 2}
            y={svgHeight - 2}
            fill="rgba(255,255,255,0.35)"
            fontSize={9}
            fontWeight={500}
            textAnchor="middle"
          >
            {formatHour(hour)}
          </text>
        ))}

        {/* Heatmap cells */}
        {data.map((row, dayIdx) =>
          row.map((value, hourIdx) => {
            const opacity = Math.max(0.07, value / maxValue)
            const x = LABEL_WIDTH + hourIdx * (CELL_W + GAP)
            const y = dayIdx * (CELL_H + GAP)
            return (
              <rect
                key={`${dayIdx}-${hourIdx}`}
                x={x}
                y={y}
                width={CELL_W}
                height={CELL_H}
                rx={2}
                fill="#22995F"
                fillOpacity={opacity}
                stroke={
                  hovered?.day === dayIdx && hovered?.hour === hourIdx
                    ? 'rgba(255,255,255,0.5)'
                    : 'none'
                }
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const svg = e.currentTarget.ownerSVGElement
                  const wrapper = wrapperRef.current
                  if (!svg || !wrapper) return
                  const pt = svg.createSVGPoint()
                  pt.x = x + CELL_W / 2
                  pt.y = y
                  const ctm = svg.getScreenCTM()
                  if (!ctm) return
                  const screenPt = pt.matrixTransform(ctm)
                  const wrapperRect = wrapper.getBoundingClientRect()
                  setHovered({
                    day: dayIdx,
                    hour: hourIdx,
                    x: screenPt.x - wrapperRect.left,
                    y: screenPt.y - wrapperRect.top,
                  })
                }}
                onMouseLeave={() => setHovered(null)}
              />
            )
          }),
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: hovered.x,
            top: hovered.y - 8,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: 8,
            padding: '6px 10px',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {DAYS[hovered.day]} {formatHour(hovered.hour)} -{' '}
          {data[hovered.day][hovered.hour]} check-ins
        </div>
      )}
    </div>
  )
}

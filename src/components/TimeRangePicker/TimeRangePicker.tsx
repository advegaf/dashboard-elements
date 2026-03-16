import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { useMembersState, useMembersDispatch, type StatsTimeRange } from '../../context/MembersContext'
import styles from './TimeRangePicker.module.css'

export type { StatsTimeRange }

const options: { value: StatsTimeRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

interface TimeRangePickerProps {
  value?: StatsTimeRange
  onChange?: (value: StatsTimeRange) => void
}

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps = {}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const controlled = value !== undefined && onChange !== undefined
  const state = useMembersState()
  const dispatch = useMembersDispatch()

  const currentValue = controlled ? value : state.statsTimeRange

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const currentLabel = options.find(o => o.value === currentValue)!.label

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.btn} onClick={() => setOpen(!open)}>
        <Calendar size={16} />
        {currentLabel}
      </button>
      {open && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`${styles.option} ${currentValue === opt.value ? styles.active : ''}`}
              onClick={() => {
                if (controlled) {
                  onChange(opt.value)
                } else {
                  dispatch!({ type: 'SET_STATS_TIME_RANGE', range: opt.value })
                }
                setOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

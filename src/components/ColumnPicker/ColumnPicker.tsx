import { useState, useRef, useEffect } from 'react'
import { Columns3 } from 'lucide-react'
import { useMembersState, useMembersDispatch } from '../../context/MembersContext'
import { OPTIONAL_COLUMNS, COLUMN_LABELS } from '../../data/members'
import styles from './ColumnPicker.module.css'

export function ColumnPicker() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const state = useMembersState()
  const dispatch = useMembersDispatch()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.btn} onClick={() => setOpen(!open)} title="Toggle columns">
        <Columns3 size={16} />
        Columns
      </button>
      {open && (
        <div className={styles.dropdown}>
          <p className={styles.dropdownTitle}>Optional Columns</p>
          {OPTIONAL_COLUMNS.map(col => (
            <label key={col} className={styles.option}>
              <input
                type="checkbox"
                checked={state.visibleColumns.has(col)}
                onChange={() => dispatch({ type: 'TOGGLE_COLUMN', column: col })}
              />
              <span>{COLUMN_LABELS[col]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

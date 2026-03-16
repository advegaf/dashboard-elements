import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './FilterDropdown.module.css'

interface Props {
  label: string
  allLabel: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
}

export function FilterDropdown({ label, allLabel, options, selected, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const buttonLabel = selected.size === 0 ? allLabel : `${label} (${selected.size})`

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.btn} onClick={() => setOpen(!open)}>
        {buttonLabel}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <label key={opt} className={styles.option}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selected.has(opt)}
                onChange={() => onToggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

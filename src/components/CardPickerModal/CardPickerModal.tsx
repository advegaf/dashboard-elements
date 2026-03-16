import { useMemo, useRef } from 'react'
import { X } from 'lucide-react'
import { ALL_CARD_TYPES, type StatCardKey } from '../../hooks/useStatsCardsConfig'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import styles from './CardPickerModal.module.css'

interface Props {
  usedKeys: StatCardKey[]
  onSelect: (key: StatCardKey) => void
  onClose: () => void
}

export function CardPickerModal({ usedKeys, onSelect, onClose }: Props) {
  const usedSet = useMemo(() => new Set(usedKeys), [usedKeys])
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, true, { onEscape: onClose })

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true" aria-label="Add stat card">
        <div className={styles.header}>
          <h2 className={styles.title}>Add Stat Card</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.grid}>
          {ALL_CARD_TYPES.map(card => {
            const used = usedSet.has(card.key)
            return (
              <button
                key={card.key}
                className={`${styles.preview} ${used ? styles.previewDisabled : ''}`}
                disabled={used}
                onClick={() => onSelect(card.key)}
                style={{ '--stat-color': card.color } as React.CSSProperties}
              >
                <span className={styles.previewLabel}>{card.label}</span>
                <span className={styles.previewSubtitle}>
                  {card.timeAware ? 'Time range' : 'Current'}
                </span>
                {used && <span className={styles.previewBadge}>In use</span>}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

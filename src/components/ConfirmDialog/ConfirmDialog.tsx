import { useState, useId, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import styles from './ConfirmDialog.module.css'

interface Props {
  title: string
  message: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'warning'
  showReason?: boolean
  reasonLabel?: string
  reasonRequired?: boolean
  onConfirm: (reason?: string) => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  showReason = false,
  reasonLabel = 'Reason',
  reasonRequired = false,
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState('')
  const canConfirm = !reasonRequired || reason.trim().length > 0
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useFocusTrap(modalRef, true, { onEscape: onCancel })

  return (
    <>
      <div className={styles.overlay} />
      <div className={styles.modal} ref={modalRef} role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.header}>
          <div className={styles.iconWrap} data-variant={confirmVariant}>
            <AlertTriangle size={20} />
          </div>
          <h2 className={styles.title} id={titleId}>{title}</h2>
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
          {showReason && (
            <label className={styles.field}>
              <span>{reasonLabel}{reasonRequired ? ' *' : ''}</span>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder={`Enter ${reasonLabel.toLowerCase()}...`}
              />
            </label>
          )}
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            data-variant={confirmVariant}
            disabled={!canConfirm}
            onClick={() => onConfirm(reason || undefined)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}

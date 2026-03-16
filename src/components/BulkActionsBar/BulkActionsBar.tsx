import { Snowflake, X, Mail, Download, XCircle } from 'lucide-react'
import { useMembersState, useMembersDispatch } from '../../context/MembersContext'
import { useToast } from '../../hooks/useToast'
import styles from './BulkActionsBar.module.css'

interface Props {
  onExportSelected: () => void
  onRequestBulkFreeze: () => void
  onRequestBulkCancel: () => void
}

export function BulkActionsBar({ onExportSelected, onRequestBulkFreeze, onRequestBulkCancel }: Props) {
  const state = useMembersState()
  const dispatch = useMembersDispatch()
  const { addToast } = useToast()
  const count = state.selectedIds.size

  const selectedMembers = state.members.filter(m => state.selectedIds.has(m.id))
  const freezableCount = selectedMembers.filter(m => m.status !== 'Frozen').length
  const cancellableCount = selectedMembers.filter(m => m.status !== 'Cancelled').length

  function handleMessage() {
    dispatch({ type: 'SET_MESSAGE_MODAL', open: true, recipients: [...state.selectedIds] })
  }

  function handleExport() {
    onExportSelected()
    addToast(`Exported ${count} member${count > 1 ? 's' : ''}`)
  }

  return (
    <div className={styles.bar}>
      <span className={styles.count}>{count} selected</span>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={onRequestBulkFreeze} disabled={freezableCount === 0}>
          <Snowflake size={14} /> Freeze {count}
        </button>
        <button className={styles.btn} onClick={onRequestBulkCancel} disabled={cancellableCount === 0}>
          <X size={14} /> Cancel {count}
        </button>
        <button className={styles.btn} onClick={handleMessage}>
          <Mail size={14} /> Message {count}
        </button>
        <button className={styles.btn} onClick={handleExport}>
          <Download size={14} /> Export {count}
        </button>
      </div>
      <button className={styles.clearBtn} onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}>
        <XCircle size={14} /> Clear
      </button>
    </div>
  )
}

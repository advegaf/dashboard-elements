import { useState, useMemo, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { useMembersState } from '../../context/MembersContext'
import { useToast } from '../../hooks/useToast'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import styles from './MessageComposeModal.module.css'

interface Props {
  recipientIds: string[]
  onClose: () => void
}

export function MessageComposeModal({ recipientIds, onClose }: Props) {
  const state = useMembersState()
  const { addToast } = useToast()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, true, { onEscape: onClose })

  const recipients = useMemo(
    () => state.members.filter(m => recipientIds.includes(m.id)).map(m => m.name).join(', '),
    [state.members, recipientIds]
  )

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    addToast(`Message sent to ${recipientIds.length} member${recipientIds.length > 1 ? 's' : ''}`)
    onClose()
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true" aria-label="Compose message">
        <div className={styles.header}>
          <h2 className={styles.title}>Compose Message</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSend} className={styles.form}>
          <div className={styles.field}>
            <span>To</span>
            <div className={styles.recipientList}>{recipients}</div>
          </div>
          <label className={styles.field}>
            <span>Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject..." />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Write your message..." />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.sendBtn}>
              <Send size={14} /> Send Message
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

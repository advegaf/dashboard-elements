import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import { useMembersActions } from '../../context/MembersContext'
import { useToast } from '../../hooks/useToast'
import { usePhotoUpload } from '../../hooks/usePhotoUpload'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import type { MemberPlan } from '../../data/members'
import styles from './AddMemberModal.module.css'

interface Props {
  onClose: () => void
}

export function AddMemberModal({ onClose }: Props) {
  const actions = useMembersActions()
  const { addToast } = useToast()
  const { photoPreview, fileInputRef, openFilePicker, handleFileChange } = usePhotoUpload()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Monthly' as MemberPlan,
    joined: new Date().toISOString().slice(0, 10),
    emergencyContact: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, true, { onEscape: onClose })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, boolean> = {}
    if (!form.name.trim()) newErrors.name = true
    if (!form.email.trim()) newErrors.email = true
    if (!photoPreview) newErrors.photo = true
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      await actions.addMember({
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: 'Active',
        joined: form.joined,
        notes: form.notes,
        emergencyContact: form.emergencyContact,
        avatarUrl: photoPreview!,
      })
      addToast('New member added successfully')
      onClose()
    } catch {
      addToast('Failed to add member', { type: 'error' })
      setSubmitting(false)
    }
  }

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: false }))
  }

  const isValid = !!photoPreview && !!form.name.trim() && !!form.email.trim()

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true" aria-label="Add new member">
        <div className={styles.header}>
          <h2 className={styles.title}>Add New Member</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.photoUploadWrap}>
            <button
              type="button"
              className={`${styles.photoUpload} ${errors.photo ? styles.photoError : ''}`}
              onClick={() => { openFilePicker(); if (errors.photo) setErrors(e => ({ ...e, photo: false })) }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className={styles.photoPreviewImg} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <Camera size={24} />
                  <span>Add Photo</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {errors.photo && <span className={styles.photoErrorText}>Photo required</span>}
          </div>
          <label className={`${styles.field} ${errors.name ? styles.fieldError : ''}`}>
            <span>Name *</span>
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
          </label>
          <label className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
            <span>Email *</span>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 000-0000" />
          </label>
          <label className={styles.field}>
            <span>Plan</span>
            <select value={form.plan} onChange={e => update('plan', e.target.value)}>
              <option>Annual</option>
              <option>Monthly</option>
              <option>Day Pass</option>
              <option>Class Pack</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Start Date</span>
            <input type="date" value={form.joined} onChange={e => update('joined', e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Emergency Contact</span>
            <input value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} placeholder="Name - Phone" />
          </label>
          <label className={styles.field}>
            <span>Notes</span>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder="Any additional notes..." />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={!isValid || submitting}>{submitting ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </>
  )
}

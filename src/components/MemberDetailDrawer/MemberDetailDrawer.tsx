import { useState, useEffect, useRef } from 'react'
import { X, Mail, Save, Camera } from 'lucide-react'
import { useMembersDispatch, useMembersActions } from '../../context/MembersContext'
import { useToast } from '../../hooks/useToast'
import { usePhotoUpload } from '../../hooks/usePhotoUpload'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { fetchCheckInHistory } from '../../lib/members-api'
import { Skeleton } from '../ui/Skeleton/Skeleton'
import { CustomSelect } from '../CustomSelect/CustomSelect'
import { formatDate, STATUS_OPTIONS, PLAN_OPTIONS, type Member, type MemberStatus, type MemberPlan } from '../../data/members'
import styles from './MemberDetailDrawer.module.css'

const planSelectOptions = PLAN_OPTIONS.map(v => ({ value: v, label: v }))
const statusSelectOptions = STATUS_OPTIONS.map(v => ({ value: v, label: v }))

interface Props {
  member: Member
  onClose: () => void
}

function getFormFromMember(member: Member) {
  return {
    name: member.name,
    email: member.email,
    phone: member.phone,
    plan: member.plan,
    status: member.status,
    notes: member.notes,
    emergencyContact: member.emergencyContact,
  }
}

export function MemberDetailDrawer({ member, onClose }: Props) {
  const dispatch = useMembersDispatch()
  const actions = useMembersActions()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { photoPreview, fileInputRef, openFilePicker, handleFileChange } = usePhotoUpload(member.avatarUrl)
  const [form, setForm] = useState(() => getFormFromMember(member))
  const [checkIns, setCheckIns] = useState<{ date: string; time: string; type: string }[]>([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const drawerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(drawerRef, true, { onEscape: onClose })

  useEffect(() => {
    let cancelled = false
    setCheckInsLoading(true)
    fetchCheckInHistory(member.id).then(data => {
      if (!cancelled) {
        setCheckIns(data)
        setCheckInsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [member.id])

  async function handleSave() {
    const updates: Partial<Member> = { ...form }
    if (photoPreview && photoPreview !== member.avatarUrl) {
      updates.avatarUrl = photoPreview
    }
    setSaving(true)
    try {
      await actions.updateMember(member.id, updates)
      setEditing(false)
      addToast('Member updated successfully')
    } catch {
      addToast('Failed to update member', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm(getFormFromMember(member))
    setEditing(false)
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer} ref={drawerRef} role="dialog" aria-modal="true" aria-label="Member details">
        <div className={styles.header}>
          <h2 className={styles.title}>Member Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Profile Section */}
        <div className={styles.section}>
          <div className={styles.profileTop}>
            {editing ? (
              <div className={styles.avatarEditWrap} onClick={openFilePicker}>
                <img className={styles.avatar} src={photoPreview || member.avatarUrl} alt={member.name} />
                <div className={styles.avatarOverlay}>
                  <Camera size={16} />
                  <span>Edit</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <img className={styles.avatar} src={member.avatarUrl} alt={member.name} />
            )}
            <div>
              <p className={styles.name}>{member.name}</p>
              <p className={styles.id}>{member.id}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.fieldValue}>{member.email}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Phone</span>
                  <span className={styles.fieldValue}>{member.phone}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Plan</span>
                  <span className={styles.fieldValue}>{member.plan}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Status</span>
                  <span className={styles.statusPill} data-status={member.status.toLowerCase()}>{member.status}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Joined</span>
                  <span className={styles.fieldValue}>{formatDate(new Date(member.joined))}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Emergency</span>
                  <span className={styles.fieldValue}>{member.emergencyContact}</span>
                </div>
              </div>
              <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit Profile</button>
            </>
          ) : (
            <div className={styles.editForm}>
              <label className={styles.formField}>
                <span>Name</span>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </label>
              <label className={styles.formField}>
                <span>Email</span>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </label>
              <label className={styles.formField}>
                <span>Phone</span>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </label>
              <div className={styles.formField}>
                <span>Plan</span>
                <CustomSelect
                  value={form.plan}
                  onChange={v => setForm(f => ({ ...f, plan: v as MemberPlan }))}
                  options={planSelectOptions}
                />
              </div>
              <div className={styles.formField}>
                <span>Status</span>
                <CustomSelect
                  value={form.status}
                  onChange={v => setForm(f => ({ ...f, status: v as MemberStatus }))}
                  options={statusSelectOptions}
                />
              </div>
              <label className={styles.formField}>
                <span>Emergency Contact</span>
                <input value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} />
              </label>
              <label className={styles.formField}>
                <span>Notes</span>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
              </label>
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Billing Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Billing</h3>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <span className={styles.fieldValue}>{member.billingStatus}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Next Payment</span>
              <span className={styles.fieldValue}>{member.nextPayment}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Method</span>
              <span className={styles.fieldValue}>{member.paymentMethod}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Total Revenue</span>
              <span className={styles.fieldValue}>${member.revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {checkInsLoading ? (
              <>
                <Skeleton width="100%" height={36} borderRadius={6} />
                <Skeleton width="100%" height={36} borderRadius={6} />
                <Skeleton width="80%" height={36} borderRadius={6} />
              </>
            ) : checkIns.length === 0 ? (
              <p className={styles.activityTotal}>No check-ins recorded</p>
            ) : (
              checkIns.map((entry) => (
                <div key={`${entry.date}-${entry.time}`} className={styles.activityItem}>
                  <span className={styles.activityDate}>{entry.date}</span>
                  <span className={styles.activityTime}>{entry.time}</span>
                  <span className={styles.activityType}>{entry.type}</span>
                </div>
              ))
            )}
            <p className={styles.activityTotal}>{member.totalVisits} total visits</p>
          </div>
        </div>

        {/* Notes & Communication */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notes & Communication</h3>
          <p className={styles.notesText}>{member.notes || 'No notes'}</p>
          <button
            className={styles.messageBtn}
            onClick={() => dispatch({ type: 'SET_MESSAGE_MODAL', open: true, recipients: [member.id] })}
          >
            <Mail size={14} /> Send Message
          </button>
        </div>
      </div>
    </>
  )
}

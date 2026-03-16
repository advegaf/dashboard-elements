import { useState } from 'react'
import { useMembersState, useMembersDispatch, useMembersActions } from '../../context/MembersContext'
import { useMembers } from '../../hooks/useMembers'
import { useToast } from '../../hooks/useToast'
import { useStatsCardsConfig } from '../../hooks/useStatsCardsConfig'
import { MembersPageHeader } from '../../components/MembersPageHeader/MembersPageHeader'
import { MembersStatsRow } from '../../components/MembersStatsRow/MembersStatsRow'
import { MembersFilterBar } from '../../components/MembersFilterBar/MembersFilterBar'
import { MembersTable } from '../../components/MembersTable/MembersTable'
import { MembersTableSkeleton } from '../../components/MembersTable/MembersTableSkeleton'
import { BulkActionsBar } from '../../components/BulkActionsBar/BulkActionsBar'
import { MemberDetailDrawer } from '../../components/MemberDetailDrawer/MemberDetailDrawer'
import { AddMemberModal } from '../../components/AddMemberModal/AddMemberModal'
import { MessageComposeModal } from '../../components/MessageComposeModal/MessageComposeModal'
import { CardPickerModal } from '../../components/CardPickerModal/CardPickerModal'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { exportMembersCsv } from '../../utils/exportCsv'
import styles from './MembersPage.module.css'

interface ConfirmState {
  title: string
  message: string
  confirmLabel: string
  confirmVariant: 'danger' | 'warning'
  showReason: boolean
  reasonLabel: string
  reasonRequired: boolean
  onConfirm: (reason?: string) => void
}

export function MembersPage() {
  const state = useMembersState()
  const dispatch = useMembersDispatch()
  const actions = useMembersActions()
  const { addToast } = useToast()
  const { selectedMember, stats, loading, error } = useMembers()
  const { activeCards, isEditMode, toggleEditMode, reorderCards, removeCard, addCard } = useStatsCardsConfig()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState | null>(null)

  function handleExportSelected() {
    const selected = state.members.filter(m => state.selectedIds.has(m.id))
    exportMembersCsv(selected, 'ledgr-members-selected')
  }

  function handleRequestFreeze(memberId: string) {
    const member = state.members.find(m => m.id === memberId)
    if (!member) return
    setConfirmDialog({
      title: 'Freeze Membership',
      message: `Are you sure you want to freeze ${member.name}'s membership? They will not be able to access the facility while frozen.`,
      confirmLabel: 'Freeze Membership',
      confirmVariant: 'warning',
      showReason: true,
      reasonLabel: 'Freeze reason',
      reasonRequired: false,
      onConfirm: async (reason) => {
        const today = new Date().toISOString().slice(0, 10)
        const noteEntry = reason ? `[Frozen ${today}] ${reason}` : `[Frozen ${today}]`
        const updatedNotes = member.notes ? `${member.notes}\n${noteEntry}` : noteEntry
        try {
          await actions.updateMember(memberId, { status: 'Frozen', notes: updatedNotes })
          addToast(`${member.name}'s membership frozen${reason ? `: ${reason}` : ''}`)
        } catch {
          addToast('Failed to freeze membership', { type: 'error' })
        }
        setConfirmDialog(null)
      },
    })
  }

  function handleRequestCancel(memberId: string) {
    const member = state.members.find(m => m.id === memberId)
    if (!member) return
    setConfirmDialog({
      title: 'Cancel Membership',
      message: `Are you sure you want to cancel ${member.name}'s membership? This action cannot be easily undone.`,
      confirmLabel: 'Cancel Membership',
      confirmVariant: 'danger',
      showReason: true,
      reasonLabel: 'Cancellation reason',
      reasonRequired: true,
      onConfirm: async (reason) => {
        const today = new Date().toISOString().slice(0, 10)
        const noteEntry = `[Cancelled ${today}] ${reason}`
        const updatedNotes = member.notes ? `${member.notes}\n${noteEntry}` : noteEntry
        try {
          await actions.updateMember(memberId, { status: 'Cancelled', notes: updatedNotes })
          addToast(`${member.name}'s membership cancelled: ${reason}`)
        } catch {
          addToast('Failed to cancel membership', { type: 'error' })
        }
        setConfirmDialog(null)
      },
    })
  }

  function handleRequestBulkFreeze() {
    const count = state.selectedIds.size
    setConfirmDialog({
      title: 'Freeze Memberships',
      message: `Are you sure you want to freeze ${count} membership${count > 1 ? 's' : ''}? These members will not be able to access the facility while frozen.`,
      confirmLabel: `Freeze ${count} Member${count > 1 ? 's' : ''}`,
      confirmVariant: 'warning',
      showReason: true,
      reasonLabel: 'Freeze reason',
      reasonRequired: false,
      onConfirm: async (reason) => {
        try {
          await actions.bulkUpdateStatus([...state.selectedIds], 'Frozen')
          addToast(`${count} member${count > 1 ? 's' : ''} frozen${reason ? `: ${reason}` : ''}`)
        } catch {
          addToast('Failed to freeze members', { type: 'error' })
        }
        setConfirmDialog(null)
      },
    })
  }

  function handleRequestBulkCancel() {
    const count = state.selectedIds.size
    setConfirmDialog({
      title: 'Cancel Memberships',
      message: `Are you sure you want to cancel ${count} membership${count > 1 ? 's' : ''}? This action cannot be easily undone.`,
      confirmLabel: `Cancel ${count} Membership${count > 1 ? 's' : ''}`,
      confirmVariant: 'danger',
      showReason: true,
      reasonLabel: 'Cancellation reason',
      reasonRequired: true,
      onConfirm: async (reason) => {
        try {
          await actions.bulkUpdateStatus([...state.selectedIds], 'Cancelled')
          addToast(`${count} membership${count > 1 ? 's' : ''} cancelled: ${reason}`)
        } catch {
          addToast('Failed to cancel memberships', { type: 'error' })
        }
        setConfirmDialog(null)
      },
    })
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <MembersPageHeader
          isCardEditMode={false}
          onToggleCardEditMode={() => {}}
        />
        <MembersTableSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <MembersPageHeader
          isCardEditMode={false}
          onToggleCardEditMode={() => {}}
        />
        <div className={styles.errorState}>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={() => actions.refetch()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <MembersPageHeader
        isCardEditMode={isEditMode}
        onToggleCardEditMode={toggleEditMode}
      />
      <MembersStatsRow
        activeCards={activeCards}
        isEditMode={isEditMode}
        stats={stats}
        onReorder={reorderCards}
        onRemove={removeCard}
        onOpenPicker={() => setIsPickerOpen(true)}
      />
      <MembersFilterBar />
      <MembersTable
        onRequestFreeze={handleRequestFreeze}
        onRequestCancel={handleRequestCancel}
      />

      {state.selectedIds.size > 0 && (
        <BulkActionsBar
          onExportSelected={handleExportSelected}
          onRequestBulkFreeze={handleRequestBulkFreeze}
          onRequestBulkCancel={handleRequestBulkCancel}
        />
      )}

      {selectedMember && (
        <MemberDetailDrawer
          member={selectedMember}
          onClose={() => dispatch({ type: 'SET_SELECTED_MEMBER', id: null })}
        />
      )}

      {state.isAddModalOpen && (
        <AddMemberModal onClose={() => dispatch({ type: 'SET_ADD_MODAL', open: false })} />
      )}

      {state.isMessageModalOpen && (
        <MessageComposeModal
          recipientIds={state.messageRecipients}
          onClose={() => dispatch({ type: 'SET_MESSAGE_MODAL', open: false })}
        />
      )}

      {isPickerOpen && (
        <CardPickerModal
          usedKeys={activeCards.map(c => c.key)}
          onSelect={(key) => { addCard(key); setIsPickerOpen(false) }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          confirmVariant={confirmDialog.confirmVariant}
          showReason={confirmDialog.showReason}
          reasonLabel={confirmDialog.reasonLabel}
          reasonRequired={confirmDialog.reasonRequired}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}

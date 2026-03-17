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
import { Skeleton } from '../../components/ui/Skeleton/Skeleton'
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

function MembersStatsRowSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={28} />
          <Skeleton width={80} height={12} />
        </div>
      ))}
    </div>
  )
}

function MembersFilterBarSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
      <Skeleton width={320} height={38} borderRadius={12} />
      <Skeleton width={100} height={38} borderRadius={12} />
      <Skeleton width={100} height={38} borderRadius={12} />
      <Skeleton width={100} height={38} borderRadius={12} />
    </div>
  )
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

  function handleMemberAction(memberId: string, action: 'freeze' | 'cancel') {
    const member = state.members.find(m => m.id === memberId)
    if (!member) return
    const isFreeze = action === 'freeze'
    const status = isFreeze ? 'Frozen' : 'Cancelled'
    const pastTense = isFreeze ? 'frozen' : 'cancelled'

    setConfirmDialog({
      title: `${isFreeze ? 'Freeze' : 'Cancel'} Membership`,
      message: `Are you sure you want to ${action} ${member.name}'s membership? ${isFreeze ? 'They will not be able to access the facility while frozen.' : 'This action cannot be easily undone.'}`,
      confirmLabel: `${isFreeze ? 'Freeze' : 'Cancel'} Membership`,
      confirmVariant: isFreeze ? 'warning' : 'danger',
      showReason: true,
      reasonLabel: isFreeze ? 'Freeze reason' : 'Cancellation reason',
      reasonRequired: !isFreeze,
      onConfirm: async (reason) => {
        const today = new Date().toISOString().slice(0, 10)
        const noteEntry = reason ? `[${status} ${today}] ${reason}` : `[${status} ${today}]`
        const updatedNotes = member.notes ? `${member.notes}\n${noteEntry}` : noteEntry
        try {
          await actions.updateMember(memberId, { status, notes: updatedNotes })
          addToast(`${member.name}'s membership ${pastTense}${reason ? `: ${reason}` : ''}`)
        } catch {
          addToast(`Failed to ${action} membership`, { type: 'error' })
        }
        setConfirmDialog(null)
      },
    })
  }

  function handleBulkAction(action: 'freeze' | 'cancel') {
    const count = state.selectedIds.size
    const plural = count > 1 ? 's' : ''
    const isFreeze = action === 'freeze'
    const status = isFreeze ? 'Frozen' : 'Cancelled'
    const pastTense = isFreeze ? 'frozen' : 'cancelled'

    setConfirmDialog({
      title: `${isFreeze ? 'Freeze' : 'Cancel'} Memberships`,
      message: `Are you sure you want to ${action} ${count} membership${plural}? ${isFreeze ? 'These members will not be able to access the facility while frozen.' : 'This action cannot be easily undone.'}`,
      confirmLabel: `${isFreeze ? 'Freeze' : 'Cancel'} ${count} ${isFreeze ? `Member${plural}` : `Membership${plural}`}`,
      confirmVariant: isFreeze ? 'warning' : 'danger',
      showReason: true,
      reasonLabel: isFreeze ? 'Freeze reason' : 'Cancellation reason',
      reasonRequired: !isFreeze,
      onConfirm: async (reason) => {
        try {
          await actions.bulkUpdateStatus([...state.selectedIds], status)
          addToast(`${count} ${isFreeze ? `member${plural}` : `membership${plural}`} ${pastTense}${reason ? `: ${reason}` : ''}`)
        } catch {
          addToast(`Failed to ${action} ${isFreeze ? 'members' : 'memberships'}`, { type: 'error' })
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
        <MembersStatsRowSkeleton />
        <MembersFilterBarSkeleton />
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
        onRequestFreeze={id => handleMemberAction(id, 'freeze')}
        onRequestCancel={id => handleMemberAction(id, 'cancel')}
      />

      {state.selectedIds.size > 0 && (
        <BulkActionsBar
          onExportSelected={handleExportSelected}
          onRequestBulkFreeze={() => handleBulkAction('freeze')}
          onRequestBulkCancel={() => handleBulkAction('cancel')}
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

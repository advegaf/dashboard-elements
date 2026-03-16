import { UserPlus, Pencil, Check } from 'lucide-react'
import { useMembersDispatch } from '../../context/MembersContext'
import { useMembers } from '../../hooks/useMembers'
import { TimeRangePicker } from '../TimeRangePicker/TimeRangePicker'
import styles from './MembersPageHeader.module.css'

interface Props {
  isCardEditMode: boolean
  onToggleCardEditMode: () => void
}

export function MembersPageHeader({ isCardEditMode, onToggleCardEditMode }: Props) {
  const dispatch = useMembersDispatch()
  const { stats } = useMembers()

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Members</h1>
        <p className={styles.subtitle}>{stats.total} total members</p>
      </div>
      <div className={styles.actions}>
        <TimeRangePicker />
        <button
          className={styles.btnIcon}
          onClick={onToggleCardEditMode}
          title={isCardEditMode ? 'Done' : 'Edit Cards'}
        >
          {isCardEditMode ? <Check size={16} /> : <Pencil size={16} />}
        </button>
        <button className={styles.btnPrimary} onClick={() => dispatch({ type: 'SET_ADD_MODAL', open: true })}>
          <UserPlus size={16} />
          Add Member
        </button>
      </div>
    </div>
  )
}

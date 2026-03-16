import { Search } from 'lucide-react'
import { useMembersState, useMembersDispatch } from '../../context/MembersContext'
import { ColumnPicker } from '../ColumnPicker/ColumnPicker'
import { FilterDropdown } from '../FilterDropdown/FilterDropdown'
import { STATUS_OPTIONS, PLAN_OPTIONS, type MemberStatus, type MemberPlan } from '../../data/members'
import styles from './MembersFilterBar.module.css'

export function MembersFilterBar() {
  const state = useMembersState()
  const dispatch = useMembersDispatch()

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search members..."
          value={state.searchQuery}
          onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
        />
      </div>
      <FilterDropdown
        label="Status"
        allLabel="All Statuses"
        options={STATUS_OPTIONS}
        selected={state.statusFilters as Set<string>}
        onToggle={v => dispatch({ type: 'TOGGLE_STATUS_FILTER', status: v as MemberStatus })}
      />
      <FilterDropdown
        label="Plan"
        allLabel="All Plans"
        options={PLAN_OPTIONS}
        selected={state.planFilters as Set<string>}
        onToggle={v => dispatch({ type: 'TOGGLE_PLAN_FILTER', plan: v as MemberPlan })}
      />
      <ColumnPicker />
    </div>
  )
}

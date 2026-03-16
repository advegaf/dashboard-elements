import { useMemo } from 'react'
import { ChevronUp, ChevronDown, Snowflake, X, Mail, Search } from 'lucide-react'
import { useMembersState, useMembersDispatch } from '../../context/MembersContext'
import { useMembers } from '../../hooks/useMembers'
import { COLUMN_LABELS, type ColumnKey, type SortableColumn } from '../../data/members'
import styles from './MembersTable.module.css'

const COLUMN_ORDER: ColumnKey[] = ['name', 'email', 'phone', 'plan', 'status', 'joined', 'lastVisit', 'totalVisits', 'revenue', 'notes', 'actions']

function formatJoined(iso: string): string {
  if (!iso || iso === '—') return iso
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

interface Props {
  onRequestFreeze: (id: string) => void
  onRequestCancel: (id: string) => void
}

export function MembersTable({ onRequestFreeze, onRequestCancel }: Props) {
  const state = useMembersState()
  const dispatch = useMembersDispatch()
  const { paginatedMembers, totalPages, sortedMembers } = useMembers()

  const columns = useMemo(() => COLUMN_ORDER.filter(c => state.visibleColumns.has(c)), [state.visibleColumns])
  const pageIds = useMemo(() => paginatedMembers.map(m => m.id), [paginatedMembers])
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => state.selectedIds.has(id))

  function handleSort(col: ColumnKey) {
    if (col === 'actions') return
    dispatch({ type: 'SET_SORT', column: col as SortableColumn })
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCol}>
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={() => dispatch({ type: 'SELECT_ALL', ids: pageIds })}
              />
            </th>
            {columns.map(col => (
              <th
                key={col}
                className={col !== 'actions' ? styles.sortable : undefined}
                onClick={() => handleSort(col)}
              >
                <span className={styles.thContent}>
                  {COLUMN_LABELS[col]}
                  {col !== 'actions' && state.sortColumn === col && (
                    state.sortDirection === 'asc'
                      ? <ChevronUp size={13} />
                      : <ChevronDown size={13} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedMembers.length === 0 ? (() => {
            const hasFilters = !!(state.searchQuery || state.statusFilters.size > 0 || state.planFilters.size > 0)
            return (
              <tr>
                <td colSpan={columns.length + 1} className={styles.emptyState}>
                  <Search size={32} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>
                    {hasFilters ? 'No members found' : 'No members yet'}
                  </p>
                  {hasFilters && (
                    <button
                      className={styles.clearFiltersBtn}
                      onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )
          })() : paginatedMembers.map(member => (
            <tr
              key={member.id}
              className={state.selectedIds.has(member.id) ? styles.selectedRow : undefined}
              onClick={() => dispatch({ type: 'SET_SELECTED_MEMBER', id: member.id })}
            >
              <td className={styles.checkboxCol} onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={state.selectedIds.has(member.id)}
                  onChange={() => dispatch({ type: 'TOGGLE_SELECT', id: member.id })}
                />
              </td>
              {columns.map(col => {
                switch (col) {
                  case 'name':
                    return (
                      <td key={col}>
                        <div className={styles.memberCell}>
                          <img className={styles.avatar} src={member.avatarUrl} alt={member.name} />
                          <span className={styles.memberName}>{member.name}</span>
                        </div>
                      </td>
                    )
                  case 'email':
                    return <td key={col}>{member.email}</td>
                  case 'phone':
                    return <td key={col}>{member.phone}</td>
                  case 'plan':
                    return (
                      <td key={col}>
                        <span className={styles.membershipPill}>{member.plan}</span>
                      </td>
                    )
                  case 'status':
                    return (
                      <td key={col}>
                        <span className={styles.statusPill} data-status={member.status.toLowerCase()}>
                          {member.status}
                        </span>
                      </td>
                    )
                  case 'joined':
                    return <td key={col} className={styles.muted}>{formatJoined(member.joined)}</td>
                  case 'lastVisit':
                    return <td key={col} className={styles.muted}>{formatJoined(member.lastVisit)}</td>
                  case 'totalVisits':
                    return <td key={col}>{member.totalVisits}</td>
                  case 'revenue':
                    return <td key={col}>${member.revenue.toLocaleString()}</td>
                  case 'notes':
                    return (
                      <td key={col} className={styles.notesCell} title={member.notes}>
                        {member.notes || '—'}
                      </td>
                    )
                  case 'actions':
                    return (
                      <td key={col} onClick={e => e.stopPropagation()}>
                        <div className={styles.actions}>
                          {member.status !== 'Frozen' && member.status !== 'Cancelled' && (
                            <button
                              className={styles.actionBtn}
                              title="Freeze membership"
                              aria-label="Freeze membership"
                              onClick={() => onRequestFreeze(member.id)}
                            >
                              <Snowflake size={14} />
                            </button>
                          )}
                          {member.status !== 'Cancelled' && (
                            <button
                              className={styles.actionBtn}
                              title="Cancel membership"
                              aria-label="Cancel membership"
                              onClick={() => onRequestCancel(member.id)}
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            className={styles.actionBtn}
                            title="Message member"
                            aria-label="Message member"
                            onClick={() => dispatch({ type: 'SET_MESSAGE_MODAL', open: true, recipients: [member.id] })}
                          >
                            <Mail size={14} />
                          </button>
                        </div>
                      </td>
                    )
                  default:
                    return null
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {sortedMembers.length > 0 && (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {sortedMembers.length === 0 ? 0 : (state.currentPage - 1) * state.rowsPerPage + 1}
          –{Math.min(state.currentPage * state.rowsPerPage, sortedMembers.length)} of {sortedMembers.length}
        </div>
        <div className={styles.paginationControls}>
          <select
            className={styles.rowsSelect}
            value={state.rowsPerPage}
            onChange={e => dispatch({ type: 'SET_ROWS_PER_PAGE', rows: Number(e.target.value) as 25 | 50 | 100 })}
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <div className={styles.pageButtons}>
            <button
              disabled={state.currentPage <= 1}
              onClick={() => dispatch({ type: 'SET_PAGE', page: state.currentPage - 1 })}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={p === state.currentPage ? styles.activePage : undefined}
                onClick={() => dispatch({ type: 'SET_PAGE', page: p })}
              >
                {p}
              </button>
            ))}
            <button
              disabled={state.currentPage >= totalPages}
              onClick={() => dispatch({ type: 'SET_PAGE', page: state.currentPage + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

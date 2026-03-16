import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, type ReactNode, type Dispatch } from 'react'
import { DEFAULT_COLUMNS, type Member, type MemberStatus, type MemberPlan, type SortableColumn, type ColumnKey } from '../data/members'
import * as membersApi from '../lib/members-api'

export type StatsTimeRange = '7d' | '30d' | '90d' | 'all'

export interface MembersState {
  members: Member[]
  loading: boolean
  error: string | null
  mutating: boolean
  searchQuery: string
  statusFilters: Set<MemberStatus>
  planFilters: Set<MemberPlan>
  statsTimeRange: StatsTimeRange
  sortColumn: SortableColumn | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  rowsPerPage: 25 | 50 | 100
  selectedIds: Set<string>
  visibleColumns: Set<ColumnKey>
  selectedMemberId: string | null
  isAddModalOpen: boolean
  isMessageModalOpen: boolean
  messageRecipients: string[]
}

export type MembersAction =
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_STATUS_FILTER'; status: MemberStatus }
  | { type: 'TOGGLE_PLAN_FILTER'; plan: MemberPlan }
  | { type: 'SET_STATS_TIME_RANGE'; range: StatsTimeRange }
  | { type: 'SET_SORT'; column: SortableColumn }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_ROWS_PER_PAGE'; rows: 25 | 50 | 100 }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'SELECT_ALL'; ids: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_COLUMN'; column: ColumnKey }
  | { type: 'SET_SELECTED_MEMBER'; id: string | null }
  | { type: 'SET_ADD_MODAL'; open: boolean }
  | { type: 'SET_MESSAGE_MODAL'; open: boolean; recipients?: string[] }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; members: Member[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'MUTATION_START' }
  | { type: 'MUTATION_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'ADD_MEMBER'; member: Member }
  | { type: 'UPDATE_MEMBER'; id: string; updates: Partial<Member> }
  | { type: 'BULK_UPDATE_STATUS'; members: Member[] }

const initialState: MembersState = {
  members: [],
  loading: true,
  error: null,
  mutating: false,
  searchQuery: '',
  statusFilters: new Set<MemberStatus>(),
  planFilters: new Set<MemberPlan>(),
  statsTimeRange: '30d',
  sortColumn: null,
  sortDirection: 'asc',
  currentPage: 1,
  rowsPerPage: 25,
  selectedIds: new Set(),
  visibleColumns: new Set(DEFAULT_COLUMNS),
  selectedMemberId: null,
  isAddModalOpen: false,
  isMessageModalOpen: false,
  messageRecipients: [],
}

function membersReducer(state: MembersState, action: MembersAction): MembersState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null }
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, members: action.members, error: null }
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'MUTATION_START':
      return { ...state, mutating: true, error: null }
    case 'MUTATION_ERROR':
      return { ...state, mutating: false, error: action.error }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'CLEAR_FILTERS':
      return { ...state, searchQuery: '', statusFilters: new Set<MemberStatus>(), planFilters: new Set<MemberPlan>(), currentPage: 1 }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query, currentPage: 1 }
    case 'TOGGLE_STATUS_FILTER': {
      const next = new Set(state.statusFilters)
      if (next.has(action.status)) next.delete(action.status)
      else next.add(action.status)
      return { ...state, statusFilters: next, currentPage: 1 }
    }
    case 'TOGGLE_PLAN_FILTER': {
      const next = new Set(state.planFilters)
      if (next.has(action.plan)) next.delete(action.plan)
      else next.add(action.plan)
      return { ...state, planFilters: next, currentPage: 1 }
    }
    case 'SET_STATS_TIME_RANGE':
      return { ...state, statsTimeRange: action.range }
    case 'SET_SORT': {
      if (state.sortColumn === action.column) {
        if (state.sortDirection === 'asc') return { ...state, sortDirection: 'desc' }
        return { ...state, sortColumn: null, sortDirection: 'asc' }
      }
      return { ...state, sortColumn: action.column, sortDirection: 'asc' }
    }
    case 'SET_PAGE':
      return { ...state, currentPage: action.page }
    case 'SET_ROWS_PER_PAGE':
      return { ...state, rowsPerPage: action.rows, currentPage: 1 }
    case 'TOGGLE_SELECT': {
      const next = new Set(state.selectedIds)
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return { ...state, selectedIds: next }
    }
    case 'SELECT_ALL': {
      const allSelected = action.ids.every(id => state.selectedIds.has(id))
      if (allSelected) {
        const next = new Set(state.selectedIds)
        action.ids.forEach(id => next.delete(id))
        return { ...state, selectedIds: next }
      }
      return { ...state, selectedIds: new Set([...state.selectedIds, ...action.ids]) }
    }
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set() }
    case 'TOGGLE_COLUMN': {
      const next = new Set(state.visibleColumns)
      if (next.has(action.column)) next.delete(action.column)
      else next.add(action.column)
      return { ...state, visibleColumns: next }
    }
    case 'SET_SELECTED_MEMBER':
      return { ...state, selectedMemberId: action.id }
    case 'SET_ADD_MODAL':
      return { ...state, isAddModalOpen: action.open }
    case 'SET_MESSAGE_MODAL':
      return { ...state, isMessageModalOpen: action.open, messageRecipients: action.open ? (action.recipients ?? state.messageRecipients) : [] }
    case 'ADD_MEMBER':
      return { ...state, members: [action.member, ...state.members], isAddModalOpen: false, mutating: false }
    case 'UPDATE_MEMBER':
      return {
        ...state,
        mutating: false,
        members: state.members.map(m => m.id === action.id ? { ...m, ...action.updates } : m),
      }
    case 'BULK_UPDATE_STATUS':
      return {
        ...state,
        mutating: false,
        members: action.members,
        selectedIds: new Set(),
      }
    default:
      return state
  }
}

interface MembersActions {
  addMember: (data: {
    name: string
    email: string
    phone: string
    status: string
    notes: string
    emergencyContact: string
    avatarUrl: string
    joined: string
  }) => Promise<Member>
  updateMember: (id: string, updates: Partial<Member>) => Promise<Member>
  bulkUpdateStatus: (ids: string[], status: MemberStatus) => Promise<void>
  refetch: () => Promise<void>
}

const MembersContext = createContext<MembersState>(initialState)
const MembersDispatchContext = createContext<Dispatch<MembersAction>>(() => {})
const MembersActionsContext = createContext<MembersActions>({
  addMember: async () => { throw new Error('Not initialized') },
  updateMember: async () => { throw new Error('Not initialized') },
  bulkUpdateStatus: async () => { throw new Error('Not initialized') },
  refetch: async () => { throw new Error('Not initialized') },
})

export function MembersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(membersReducer, initialState)

  const loadMembers = useCallback(async () => {
    dispatch({ type: 'LOAD_START' })
    try {
      const members = await membersApi.fetchMembers()
      dispatch({ type: 'LOAD_SUCCESS', members })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed. Please try again.'
      dispatch({ type: 'LOAD_ERROR', error: message })
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const actions: MembersActions = useMemo(() => ({
    addMember: async (data) => {
      dispatch({ type: 'MUTATION_START' })
      try {
        const member = await membersApi.addMember(data)
        dispatch({ type: 'ADD_MEMBER', member })
        return member
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add member.'
        dispatch({ type: 'MUTATION_ERROR', error: message })
        throw err
      }
    },

    updateMember: async (id, updates) => {
      dispatch({ type: 'MUTATION_START' })
      try {
        const member = await membersApi.updateMember(id, updates)
        dispatch({ type: 'UPDATE_MEMBER', id, updates: member })
        return member
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update member.'
        dispatch({ type: 'MUTATION_ERROR', error: message })
        throw err
      }
    },

    bulkUpdateStatus: async (ids, status) => {
      dispatch({ type: 'MUTATION_START' })
      try {
        const members = await membersApi.bulkUpdateStatus(ids, status)
        dispatch({ type: 'BULK_UPDATE_STATUS', members })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update members.'
        dispatch({ type: 'MUTATION_ERROR', error: message })
        throw err
      }
    },

    refetch: loadMembers,
  }), [loadMembers])

  return (
    <MembersContext.Provider value={state}>
      <MembersDispatchContext.Provider value={dispatch}>
        <MembersActionsContext.Provider value={actions}>
          {children}
        </MembersActionsContext.Provider>
      </MembersDispatchContext.Provider>
    </MembersContext.Provider>
  )
}

export function useMembersState() {
  return useContext(MembersContext)
}

export function useMembersDispatch() {
  return useContext(MembersDispatchContext)
}

export function useMembersActions() {
  return useContext(MembersActionsContext)
}

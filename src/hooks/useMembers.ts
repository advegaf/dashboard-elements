import { useMemo } from 'react'
import { useMembersState } from '../context/MembersContext'
import type { Member, SortableColumn } from '../data/members'

function matchesSearch(member: Member, query: string): boolean {
  const q = query.toLowerCase()
  return (
    member.name.toLowerCase().includes(q) ||
    member.email.toLowerCase().includes(q) ||
    member.plan.toLowerCase().includes(q) ||
    member.status.toLowerCase().includes(q) ||
    member.phone.includes(q)
  )
}

function compareMember(a: Member, b: Member, column: SortableColumn): number {
  switch (column) {
    case 'name': return a.name.localeCompare(b.name)
    case 'email': return a.email.localeCompare(b.email)
    case 'plan': return a.plan.localeCompare(b.plan)
    case 'status': return a.status.localeCompare(b.status)
    case 'joined': return a.joined.localeCompare(b.joined)
    case 'phone': return a.phone.localeCompare(b.phone)
    case 'lastVisit': return a.lastVisit.localeCompare(b.lastVisit)
    case 'totalVisits': return a.totalVisits - b.totalVisits
    case 'revenue': return a.revenue - b.revenue
    case 'notes': return a.notes.localeCompare(b.notes)
    default: return 0
  }
}

export function useMembers() {
  const state = useMembersState()

  const filteredMembers = useMemo(() => {
    return state.members.filter(m => {
      if (state.searchQuery && !matchesSearch(m, state.searchQuery)) return false
      if (state.statusFilters.size > 0 && !state.statusFilters.has(m.status)) return false
      if (state.planFilters.size > 0 && !state.planFilters.has(m.plan)) return false
      return true
    })
  }, [state.members, state.searchQuery, state.statusFilters, state.planFilters])

  const sortedMembers = useMemo(() => {
    if (!state.sortColumn) return filteredMembers
    const sorted = [...filteredMembers].sort((a, b) => compareMember(a, b, state.sortColumn!))
    return state.sortDirection === 'desc' ? sorted.reverse() : sorted
  }, [filteredMembers, state.sortColumn, state.sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / state.rowsPerPage))

  const paginatedMembers = useMemo(() => {
    const start = (state.currentPage - 1) * state.rowsPerPage
    return sortedMembers.slice(start, start + state.rowsPerPage)
  }, [sortedMembers, state.currentPage, state.rowsPerPage])

  const stats = useMemo(() => {
    const rangeDays: Record<string, number | null> = { '7d': 7, '30d': 30, '90d': 90, 'all': null }
    const days = rangeDays[state.statsTimeRange]
    let cutoffISO: string | null = null
    if (days !== null) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      cutoffISO = cutoff.toISOString().slice(0, 10)
    }
    const now = new Date()
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const fourteenDaysAgoISO = fourteenDaysAgo.toISOString().slice(0, 10)

    let active = 0, frozen = 0, cancelled = 0, pastDue = 0, atRisk = 0
    let visitRateSum = 0
    const membersInRange: Member[] = []

    for (const m of state.members) {
      if (m.status === 'Active') {
        active++
        if (m.lastVisit !== '—' && m.lastVisit < fourteenDaysAgoISO) atRisk++
        const joinDate = new Date(m.joined)
        const weeksSince = Math.max(1, (now.getTime() - joinDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        visitRateSum += m.totalVisits / weeksSince
      } else if (m.status === 'Frozen') {
        frozen++
      } else {
        cancelled++
      }
      if (m.billingStatus === 'Past Due') pastDue++
      if (!cutoffISO || m.joined >= cutoffISO) membersInRange.push(m)
    }

    const avgVisitsPerWeek = active > 0 ? parseFloat((visitRateSum / active).toFixed(1)) : 0
    const revenueInPeriod = membersInRange.reduce((sum, m) => sum + m.revenue, 0)
    const retentionRate = membersInRange.length > 0
      ? Math.round((membersInRange.filter(m => m.status === 'Active').length / membersInRange.length) * 100)
      : 0

    return {
      total: state.members.length,
      active,
      frozen,
      cancelled,
      newInPeriod: membersInRange.length,
      atRisk,
      pastDue,
      avgVisitsPerWeek,
      revenueInPeriod,
      retentionRate,
    }
  }, [state.members, state.statsTimeRange])

  const selectedMember = useMemo(() => {
    if (!state.selectedMemberId) return null
    return state.members.find(m => m.id === state.selectedMemberId) ?? null
  }, [state.members, state.selectedMemberId])

  return {
    filteredMembers,
    sortedMembers,
    paginatedMembers,
    totalPages,
    stats,
    selectedMember,
    loading: state.loading,
    error: state.error,
    mutating: state.mutating,
  }
}

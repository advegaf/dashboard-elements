import { useMemo } from 'react'
import type { StatsTimeRange } from '@/lib/dashboard-aggregations'

export type ActionIssueType = 'past-due' | 'failed-card' | 'at-risk'

export interface ActionQueueRow {
  id: string
  memberName: string
  issueType: ActionIssueType
  amount?: string
  amountCents?: number
  days?: number
  lastActivity: string
  urgency: number
}

export interface PulseCheckedIn {
  count: number
  delta: number
  sparkline: number[]
}

export interface PulseNewMember {
  count: number
  delta: number
  recentInitials: string[]
}

export type ActivityEventType = 'check-in' | 'signup' | 'payment' | 'missed'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  memberName: string
  description: string
  time: string
}

export interface OverviewDataResult {
  actionQueue: ActionQueueRow[]
  checkedInToday: PulseCheckedIn
  newThisWeek: PulseNewMember
  recentActivity: ActivityEvent[]
  dateRange: string
  loading: boolean
}

const mockActionQueue: ActionQueueRow[] = [
  { id: 'a1', memberName: 'Jane Doe',       issueType: 'past-due',    amount: '$89',  amountCents: 8900,  days: 2,  lastActivity: '2d ago', urgency: 9 },
  { id: 'a2', memberName: 'Mike Ortiz',     issueType: 'failed-card', amount: '$120', amountCents: 12000, days: 1,  lastActivity: '1d ago', urgency: 10 },
  { id: 'a3', memberName: 'Rita Kelley',    issueType: 'at-risk',                                         days: 18, lastActivity: '18d ago', urgency: 6 },
  { id: 'a4', memberName: 'Alex Patel',     issueType: 'past-due',    amount: '$45',  amountCents: 4500,  days: 5,  lastActivity: '5d ago', urgency: 8 },
  { id: 'a5', memberName: 'Sam Lee',        issueType: 'failed-card', amount: '$89',  amountCents: 8900,  days: 3,  lastActivity: '3d ago', urgency: 9 },
  { id: 'a6', memberName: 'Natalie Owens',  issueType: 'past-due',    amount: '$220', amountCents: 22000, days: 8,  lastActivity: '8d ago', urgency: 7 },
  { id: 'a7', memberName: 'Tyler Brooks',   issueType: 'at-risk',                                         days: 22, lastActivity: '22d ago', urgency: 5 },
  { id: 'a8', memberName: 'Priya Sharma',   issueType: 'past-due',    amount: '$89',  amountCents: 8900,  days: 1,  lastActivity: '1d ago', urgency: 8 },
  { id: 'a9', memberName: 'Robert Akins',   issueType: 'failed-card', amount: '$149', amountCents: 14900, days: 2,  lastActivity: '2d ago', urgency: 9 },
  { id: 'a10',memberName: 'Diana Reyes',    issueType: 'at-risk',                                         days: 14, lastActivity: '14d ago', urgency: 6 },
]

const mockCheckedInToday: PulseCheckedIn = {
  count: 24,
  delta: 8,
  sparkline: [12, 15, 14, 18, 20, 22, 24],
}

const mockNewThisWeek: PulseNewMember = {
  count: 3,
  delta: 1,
  recentInitials: ['AB', 'MR', 'KP'],
}

const mockRecentActivity: ActivityEvent[] = [
  { id: 'e1', type: 'check-in', memberName: 'Sarah Mitchell', description: 'checked in',            time: '5:15 AM' },
  { id: 'e2', type: 'check-in', memberName: 'James Cooper',   description: 'checked in',            time: '5:42 AM' },
  { id: 'e3', type: 'signup',   memberName: 'Alex Baker',     description: 'signed up — Monthly',   time: '6:02 AM' },
  { id: 'e4', type: 'check-in', memberName: 'Diana Reyes',    description: 'checked in',            time: '6:08 AM' },
  { id: 'e5', type: 'payment',  memberName: 'Marcus Johnson', description: 'paid $89 — Monthly',    time: '6:33 AM' },
  { id: 'e6', type: 'check-in', memberName: 'Emily Zhang',    description: 'checked in',            time: '7:01 AM' },
  { id: 'e7', type: 'missed',   memberName: 'Robert Akins',   description: "hasn't checked in 14d", time: '—' },
  { id: 'e8', type: 'check-in', memberName: 'Priya Sharma',   description: 'checked in',            time: '8:05 AM' },
]

const rangeLabels: Record<StatsTimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'all': 'All time',
}

export function useOverviewData(range: StatsTimeRange): OverviewDataResult {
  return useMemo(
    () => ({
      actionQueue: [...mockActionQueue].sort((a, b) => b.urgency - a.urgency),
      checkedInToday: mockCheckedInToday,
      newThisWeek: mockNewThisWeek,
      recentActivity: mockRecentActivity,
      dateRange: rangeLabels[range],
      loading: false,
    }),
    [range],
  )
}

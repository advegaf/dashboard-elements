export type MemberStatus = 'Active' | 'Frozen' | 'Cancelled'
export type MemberPlan = 'Annual' | 'Monthly' | 'Day Pass' | 'Class Pack'

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  plan: MemberPlan
  status: MemberStatus
  joined: string
  lastVisit: string
  totalVisits: number
  revenue: number
  notes: string
  emergencyContact: string
  avatarUrl: string
  billingStatus: 'Current' | 'Past Due' | 'Pending'
  nextPayment: string
  paymentMethod: string
  checkInHistory: { date: string; time: string; type: string }[]
}

export const STATUS_OPTIONS: MemberStatus[] = ['Active', 'Frozen', 'Cancelled']
export const PLAN_OPTIONS: MemberPlan[] = ['Annual', 'Monthly', 'Day Pass', 'Class Pack']

export type SortableColumn = 'name' | 'email' | 'plan' | 'status' | 'joined' | 'phone' | 'lastVisit' | 'totalVisits' | 'revenue' | 'notes'

export type ColumnKey = 'name' | 'email' | 'plan' | 'status' | 'joined' | 'actions' | 'phone' | 'lastVisit' | 'totalVisits' | 'revenue' | 'notes'

export const DEFAULT_COLUMNS: ColumnKey[] = ['name', 'email', 'plan', 'status', 'joined', 'actions']
export const OPTIONAL_COLUMNS: ColumnKey[] = ['phone', 'lastVisit', 'totalVisits', 'revenue', 'notes']

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  name: 'Member',
  email: 'Email',
  plan: 'Plan',
  status: 'Status',
  joined: 'Joined',
  actions: 'Actions',
  phone: 'Phone',
  lastVisit: 'Last Visit',
  totalVisits: 'Total Visits',
  revenue: 'Revenue',
  notes: 'Notes',
}

export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate()
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`
}

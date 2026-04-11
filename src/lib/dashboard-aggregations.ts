import type { StatsTimeRange } from '../context/MembersContext'
import { formatDateShort, formatDateWithSuffix } from '../utils/dates'
import { fallbackAvatarUrl } from '../utils/avatar'
import { capitalize } from '../utils/strings'

// === Raw row types (from Supabase queries) ===

export interface MemberSummaryRow {
  member_id?: string
  status: string
  joined_at: string
}

export interface PaymentEventRow {
  member_id?: string
  amount_cents: number
  status: string
  created_at: string
  event_type: string
  failure_reason?: string
}

export interface CheckInEventRow {
  member_id?: string
  scanned_at: string
}

export interface RecentCheckInRow {
  id: string
  scanned_at: string
  members: {
    full_name: string
    avatar_url: string | null
    status: string
    billing_status: string | null
    subscriptions: Array<{
      membership_plans: { name: string } | null
    }>
  }
}

// === Aggregated types ===

export interface DateRange {
  since: Date | null
  extendedSince: Date | null
  label: string
}

export interface KpiValue {
  value: string
  trend?: { value: number; direction: 'up' | 'down' }
  sparkline: number[]
  memberCount?: number
}

export type RiskTier = 'critical' | 'high' | 'medium' | 'ok'

export interface ChurnRiskData {
  total: number
  critical: number
  high: number
  medium: number
  trend?: { value: number; direction: 'up' | 'down' }
}

export interface KpiData {
  retention: KpiValue
  revenue: KpiValue
  churnRisk: ChurnRiskData
  signups: KpiValue
}

export interface RevenueBucket {
  name: string
  gray: number
  revenue: number
}

export interface SignupBucket {
  name: string
  value: number
}

export interface RetentionBucket {
  name: string
  value: number
}

export interface SummaryRow {
  label: string
  value: string
  change: string
  positive: boolean
}

export interface RevenueSlice {
  label: string
  value: number
  formatted: string
  change: string
  positive: boolean
}

export interface RecentCheckIn {
  id: string
  name: string
  avatarUrl: string
  time: string
  membership: string
  billingStatus: string
}

export interface FailedPaymentSummary {
  label: string
  count: number
  amount: string
  amountCents: number
}

export interface FailedPaymentData {
  totalAmount: string
  totalAmountCents: number
  totalCount: number
  trend?: { value: number; direction: 'up' | 'down' }
  rows: FailedPaymentSummary[]
}

// === Helpers ===

function formatCurrency(cents: number): string {
  const dollars = cents / 100
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function resolveTimezone(tz: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date())
    return tz
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

function createTimeBuckets(since: Date | null, count: number, dataPoints?: string[]): Array<{ start: Date; end: Date; label: string }> {
  const now = new Date()
  let start: Date
  if (since) {
    start = since
  } else if (dataPoints && dataPoints.length > 0) {
    start = new Date(Math.min(...dataPoints.map(d => new Date(d).getTime())))
  } else {
    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  }

  const range = now.getTime() - start.getTime()
  if (range <= 0) return Array.from({ length: count }, () => ({ start: now, end: now, label: formatDateShort(now) }))

  const bucketSize = range / count
  return Array.from({ length: count }, (_, i) => ({
    start: new Date(start.getTime() + bucketSize * i),
    end: new Date(start.getTime() + bucketSize * (i + 1)),
    label: formatDateShort(new Date(start.getTime() + bucketSize * i)),
  }))
}

function computeTrend(current: number, prior: number): { value: number; direction: 'up' | 'down' } | undefined {
  if (prior === 0 && current === 0) return undefined
  if (prior === 0) return { value: 100, direction: 'up' }
  const pct = ((current - prior) / prior) * 100
  return { value: Math.abs(Math.round(pct * 10) / 10), direction: pct >= 0 ? 'up' : 'down' }
}

function daysForRange(timeRange: StatsTimeRange): number {
  return timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
}

function rangeToKey(range: DateRange): StatsTimeRange {
  if (!range.since) return 'all'
  const days = Math.round((Date.now() - range.since.getTime()) / 86400000)
  if (days <= 7) return '7d'
  if (days <= 30) return '30d'
  return '90d'
}

// === Main functions ===

export function computeDateRange(timeRange: StatsTimeRange): DateRange {
  if (timeRange === 'all') {
    return { since: null, extendedSince: null, label: 'All time' }
  }

  const now = new Date()
  const dayCount = daysForRange(timeRange)

  const since = new Date(now)
  since.setDate(since.getDate() - dayCount)
  since.setHours(0, 0, 0, 0)

  const extendedSince = new Date(now)
  extendedSince.setDate(extendedSince.getDate() - dayCount * 2)
  extendedSince.setHours(0, 0, 0, 0)

  return { since, extendedSince, label: `${formatDateWithSuffix(since)} - ${formatDateWithSuffix(now)}` }
}

export function aggregateKpis(
  members: MemberSummaryRow[],
  payments: PaymentEventRow[],
  checkIns: CheckInEventRow[],
  range: DateRange,
): KpiData {
  const { since } = range
  const timeRange = rangeToKey(range)

  const inCurrent = (dateStr: string) => !since || new Date(dateStr) >= since
  const inPrior = (dateStr: string) => {
    if (!since) return false
    const priorStart = new Date(since)
    priorStart.setDate(priorStart.getDate() - daysForRange(timeRange))
    const d = new Date(dateStr)
    return d >= priorStart && d < since
  }

  // Retention: non-cancelled / total
  const nonCancelledCount = members.filter(m => m.status !== 'cancelled').length
  const totalCount = members.length
  const retentionRate = totalCount > 0 ? (nonCancelledCount / totalCount) * 100 : 0

  // Prior-period retention for trend
  let retentionTrend: { value: number; direction: 'up' | 'down' } | undefined
  if (timeRange !== 'all' && since) {
    const priorStart = new Date(since)
    priorStart.setDate(priorStart.getDate() - daysForRange(timeRange))
    const priorMembers = members.filter(m => new Date(m.joined_at) <= since)
    const priorNonCancelled = priorMembers.filter(m => m.status !== 'cancelled').length
    const priorRetention = priorMembers.length > 0 ? (priorNonCancelled / priorMembers.length) * 100 : 0
    retentionTrend = computeTrend(retentionRate, priorRetention)
  }

  const retBuckets = createTimeBuckets(since, 8, members.map(m => m.joined_at))
  const retentionSparkline = retBuckets.map(b => {
    const atTime = members.filter(m => new Date(m.joined_at) <= b.end)
    const activeAtTime = atTime.filter(m => m.status !== 'cancelled').length
    return atTime.length > 0 ? (activeAtTime / atTime.length) * 100 : 0
  })

  // Revenue
  const succeeded = payments.filter(p => p.status === 'succeeded')
  const currentRevCents = succeeded.filter(p => inCurrent(p.created_at)).reduce((s, p) => s + p.amount_cents, 0)
  const priorRevCents = succeeded.filter(p => inPrior(p.created_at)).reduce((s, p) => s + p.amount_cents, 0)

  const revBuckets = createTimeBuckets(since, 8, succeeded.map(p => p.created_at))
  const revenueSparkline = revBuckets.map(b =>
    succeeded
      .filter(p => { const t = new Date(p.created_at).getTime(); return t >= b.start.getTime() && t < b.end.getTime() })
      .reduce((s, p) => s + p.amount_cents, 0) / 100,
  )

  // Churn Risk
  const churnRisk = aggregateChurnRisk(members, payments, checkIns, range)

  // Signups
  const currentSignups = members.filter(m => inCurrent(m.joined_at))
  const priorSignups = members.filter(m => inPrior(m.joined_at))

  const sigBuckets = createTimeBuckets(since, 8, members.map(m => m.joined_at))
  const signupsSparkline = sigBuckets.map(b =>
    members.filter(m => { const t = new Date(m.joined_at).getTime(); return t >= b.start.getTime() && t < b.end.getTime() }).length,
  )

  return {
    retention: {
      value: `${retentionRate.toFixed(1)}%`,
      trend: retentionTrend,
      sparkline: retentionSparkline,
      memberCount: totalCount,
    },
    revenue: {
      value: formatCurrency(currentRevCents),
      trend: timeRange !== 'all' ? computeTrend(currentRevCents, priorRevCents) : undefined,
      sparkline: revenueSparkline,
    },
    churnRisk,
    signups: {
      value: formatNumber(currentSignups.length),
      trend: timeRange !== 'all' ? computeTrend(currentSignups.length, priorSignups.length) : undefined,
      sparkline: signupsSparkline,
    },
  }
}

function scoreMember(
  member: MemberSummaryRow,
  memberPayments: PaymentEventRow[],
  memberCheckIns: CheckInEventRow[],
  referenceDate: Date,
  midpoint: Date,
): number {
  // Payment score (0-40)
  let paymentScore = 0
  if (memberPayments.some(p => p.status === 'failed')) {
    paymentScore = 40
  } else if (member.status === 'past_due') {
    paymentScore = 35
  } else if (memberPayments.some(p => p.status === 'pending')) {
    paymentScore = 25
  }

  // Absence score (0-35)
  let absenceScore = 0
  if (memberCheckIns.length === 0) {
    absenceScore = 35
  } else {
    const lastScan = Math.max(...memberCheckIns.map(c => new Date(c.scanned_at).getTime()))
    const daysSinceLast = (referenceDate.getTime() - lastScan) / 86400000
    if (daysSinceLast >= 30) absenceScore = 35
    else if (daysSinceLast >= 21) absenceScore = 28
    else if (daysSinceLast >= 14) absenceScore = 20
    else if (daysSinceLast >= 7) absenceScore = 10
  }

  // Visit decline score (0-25)
  let declineScore = 0
  const recentHalf = memberCheckIns.filter(c => new Date(c.scanned_at) >= midpoint).length
  const earlierHalf = memberCheckIns.filter(c => new Date(c.scanned_at) < midpoint).length
  if (earlierHalf > 0) {
    const dropPct = 1 - recentHalf / earlierHalf
    if (dropPct >= 0.75) declineScore = 25
    else if (dropPct >= 0.5) declineScore = 18
    else if (dropPct >= 0.25) declineScore = 10
  }

  return paymentScore + absenceScore + declineScore
}

function groupByMemberId<T extends { member_id?: string }>(
  items: T[],
  filter?: (item: T) => boolean,
): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    if (!item.member_id) continue
    if (filter && !filter(item)) continue
    const list = map.get(item.member_id) ?? []
    list.push(item)
    map.set(item.member_id, list)
  }
  return map
}

export function aggregateChurnRisk(
  members: MemberSummaryRow[],
  payments: PaymentEventRow[],
  checkIns: CheckInEventRow[],
  range: DateRange,
): ChurnRiskData {
  const { since } = range
  const timeRange = rangeToKey(range)
  const now = new Date()
  const activeMembers = members.filter(m => m.status !== 'cancelled')

  const dayCount = since ? (now.getTime() - since.getTime()) / 86400000 : 90
  const halfMs = (dayCount / 2) * 86400000
  const midpoint = new Date(now.getTime() - halfMs)

  const paymentsByMember = groupByMemberId(payments, p => !since || new Date(p.created_at) >= since)
  const checkInsByMember = groupByMemberId(checkIns, c => !since || new Date(c.scanned_at) >= since)

  let critical = 0
  let high = 0
  let medium = 0

  for (const member of activeMembers) {
    const mid = member.member_id
    if (!mid) continue

    const totalScore = scoreMember(
      member,
      paymentsByMember.get(mid) ?? [],
      checkInsByMember.get(mid) ?? [],
      now,
      midpoint,
    )
    if (totalScore >= 70) critical++
    else if (totalScore >= 45) high++
    else if (totalScore >= 25) medium++
  }

  const total = critical + high + medium

  // Trend: compare with prior period
  let trend: ChurnRiskData['trend']
  if (timeRange !== 'all' && since) {
    const priorStart = new Date(since)
    priorStart.setDate(priorStart.getDate() - daysForRange(timeRange))

    const inPriorPeriod = (dateStr: string) => {
      const d = new Date(dateStr)
      return d >= priorStart && d < since
    }

    const priorPaymentsByMember = groupByMemberId(payments, p => inPriorPeriod(p.created_at))
    const priorCheckInsByMember = groupByMemberId(checkIns, c => inPriorPeriod(c.scanned_at))

    const priorMidpoint = new Date(priorStart.getTime() + halfMs)
    let priorTotal = 0

    for (const member of activeMembers) {
      const mid = member.member_id
      if (!mid) continue

      const score = scoreMember(
        member,
        priorPaymentsByMember.get(mid) ?? [],
        priorCheckInsByMember.get(mid) ?? [],
        since,
        priorMidpoint,
      )
      if (score >= 25) priorTotal++
    }

    trend = computeTrend(total, priorTotal)
  }

  return { total, critical, high, medium, trend }
}

export function aggregateRevenueSeries(payments: PaymentEventRow[], range: DateRange): RevenueBucket[] {
  const { since } = range
  const currentPayments = since ? payments.filter(p => new Date(p.created_at) >= since) : payments
  const buckets = createTimeBuckets(since, 8, currentPayments.map(p => p.created_at))

  return buckets.map(b => {
    const allInBucket = currentPayments.filter(p => {
      const t = new Date(p.created_at).getTime()
      return t >= b.start.getTime() && t < b.end.getTime()
    })
    const succeededInBucket = allInBucket.filter(p => p.status === 'succeeded')
    return {
      name: b.label,
      gray: allInBucket.reduce((s, p) => s + p.amount_cents, 0) / 100000,
      revenue: succeededInBucket.reduce((s, p) => s + p.amount_cents, 0) / 100000,
    }
  })
}

export function aggregateRevenueSlices(payments: PaymentEventRow[], timeRange: StatsTimeRange, range?: DateRange): RevenueSlice[] {
  const { since } = range ?? computeDateRange(timeRange)
  const inCurrent = (d: string) => !since || new Date(d) >= since
  const inPrior = (d: string) => {
    if (!since) return false
    const priorStart = new Date(since)
    priorStart.setDate(priorStart.getDate() - daysForRange(timeRange))
    const dt = new Date(d)
    return dt >= priorStart && dt < since
  }

  const currentPayments = payments.filter(p => p.status === 'succeeded' && inCurrent(p.created_at))
  const priorPayments = payments.filter(p => p.status === 'succeeded' && inPrior(p.created_at))

  // Pre-group by event_type to avoid repeated .filter() calls
  const currentByType = new Map<string, number>()
  for (const p of currentPayments) {
    currentByType.set(p.event_type, (currentByType.get(p.event_type) ?? 0) + p.amount_cents)
  }
  const priorByType = new Map<string, number>()
  for (const p of priorPayments) {
    priorByType.set(p.event_type, (priorByType.get(p.event_type) ?? 0) + p.amount_cents)
  }

  const types = [...currentByType.keys()]
  if (types.length === 0) return []

  return types.map(type => {
    const currentSum = currentByType.get(type) ?? 0
    const priorSum = priorByType.get(type) ?? 0
    const trend = computeTrend(currentSum, priorSum)

    return {
      label: capitalize(type).replace(/_/g, ' '),
      value: currentSum,
      formatted: formatCurrency(currentSum),
      change: trend ? `${trend.direction === 'up' ? '+' : '-'}${trend.value}%` : '-',
      positive: trend ? trend.direction === 'up' : true,
    }
  })
}

export function toSummaryRows(slices: RevenueSlice[]): SummaryRow[] {
  return slices.map(s => ({
    label: s.label,
    value: s.formatted,
    change: s.change,
    positive: s.positive,
  }))
}

export function aggregateRetentionSeries(
  members: MemberSummaryRow[],
  range: DateRange,
): RetentionBucket[] {
  const { since } = range
  const buckets = createTimeBuckets(since, 10, members.map(m => m.joined_at))

  return buckets.map(b => {
    const atTime = members.filter(m => new Date(m.joined_at) <= b.end)
    const activeAtTime = atTime.filter(m => m.status !== 'cancelled').length
    const rate = atTime.length > 0 ? (activeAtTime / atTime.length) * 100 : 0
    return {
      name: b.label,
      value: Math.round(rate * 10) / 10,
    }
  })
}

export function aggregateSignupSeries(members: MemberSummaryRow[], range: DateRange): SignupBucket[] {
  const { since } = range
  const currentMembers = since ? members.filter(m => new Date(m.joined_at) >= since) : members
  const buckets = createTimeBuckets(since, 10, currentMembers.map(m => m.joined_at))

  return buckets.map(b => ({
    name: b.label,
    value: currentMembers.filter(m => {
      const t = new Date(m.joined_at).getTime()
      return t >= b.start.getTime() && t < b.end.getTime()
    }).length,
  }))
}

export function aggregateHeatmap(checkIns: CheckInEventRow[], timezone: string): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))

  const tz = resolveTimezone(timezone)

  const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', hour12: false })

  for (const checkIn of checkIns) {
    const parts = formatter.formatToParts(new Date(checkIn.scanned_at))
    const dayStr = parts.find(p => p.type === 'weekday')?.value ?? ''
    const hourStr = parts.find(p => p.type === 'hour')?.value ?? '0'
    const dayIdx = dayMap[dayStr]
    const hour = parseInt(hourStr) % 24
    if (dayIdx !== undefined && hour >= 0 && hour < 24) {
      grid[dayIdx][hour]++
    }
  }

  return grid
}

export function aggregateCheckinPeriods(checkIns: CheckInEventRow[], timezone: string): SummaryRow[] {
  const tz = resolveTimezone(timezone)

  const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false })

  let morning = 0
  let afternoon = 0
  let evening = 0

  for (const checkIn of checkIns) {
    const parts = hourFormatter.formatToParts(new Date(checkIn.scanned_at))
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0') % 24
    if (hour >= 6 && hour < 12) morning++
    else if (hour >= 12 && hour < 17) afternoon++
    else if (hour >= 17 && hour < 22) evening++
  }

  const total = morning + afternoon + evening

  return [
    { label: 'Morning (6\u201311 AM)', value: formatNumber(morning), change: total > 0 ? `${((morning / total) * 100).toFixed(0)}%` : '0%', positive: true },
    { label: 'Afternoon (12\u20134 PM)', value: formatNumber(afternoon), change: total > 0 ? `${((afternoon / total) * 100).toFixed(0)}%` : '0%', positive: true },
    { label: 'Evening (5\u20139 PM)', value: formatNumber(evening), change: total > 0 ? `${((evening / total) * 100).toFixed(0)}%` : '0%', positive: true },
  ]
}

export function mapRecentCheckIns(rows: RecentCheckInRow[]): RecentCheckIn[] {
  return rows.map(row => {
    const member = row.members
    const activeSub = member.subscriptions?.find(s => s.membership_plans)
    const planName = activeSub?.membership_plans?.name ?? 'No Plan'
    const avatarUrl = member.avatar_url ?? fallbackAvatarUrl(member.full_name)
    const dt = new Date(row.scanned_at)
    const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const billingStatus = member.billing_status
      ? capitalize(member.billing_status)
      : 'Pending'

    return {
      id: row.id,
      name: member.full_name,
      avatarUrl,
      time,
      membership: planName,
      billingStatus,
    }
  })
}

const FAILURE_REASON_LABELS: Record<string, string> = {
  // Card validity
  expired_card: 'Expired Card',
  // Funds & limits
  insufficient_funds: 'Insufficient Funds',
  card_velocity_exceeded: 'Insufficient Funds',
  withdrawal_count_limit_exceeded: 'Insufficient Funds',
  // Generic declines
  generic_decline: 'Card Declined',
  do_not_honor: 'Card Declined',
  call_issuer: 'Card Declined',
  not_permitted: 'Card Declined',
  transaction_not_allowed: 'Card Declined',
  service_not_allowed: 'Card Declined',
  security_violation: 'Card Declined',
  no_action_taken: 'Card Declined',
  // Authentication
  authentication_required: 'Authentication Required',
  // Invalid card details
  incorrect_number: 'Invalid Card Details',
  invalid_number: 'Invalid Card Details',
  incorrect_cvc: 'Invalid Card Details',
  invalid_cvc: 'Invalid Card Details',
  incorrect_zip: 'Invalid Card Details',
  invalid_expiry_month: 'Invalid Card Details',
  invalid_expiry_year: 'Invalid Card Details',
  invalid_account: 'Invalid Card Details',
  // Fraud & blocked
  fraudulent: 'Fraud Suspected',
  merchant_blacklist: 'Fraud Suspected',
  lost_card: 'Lost or Stolen Card',
  stolen_card: 'Lost or Stolen Card',
  pickup_card: 'Lost or Stolen Card',
  restricted_card: 'Lost or Stolen Card',
  // Processing errors
  processing_error: 'Processing Error',
  issuer_not_available: 'Processing Error',
  reenter_transaction: 'Processing Error',
  try_again_later: 'Processing Error',
  // Card type
  card_not_supported: 'Card Not Supported',
  currency_not_supported: 'Card Not Supported',
  // PIN
  incorrect_pin: 'Incorrect PIN',
  invalid_pin: 'Incorrect PIN',
  offline_pin_required: 'Incorrect PIN',
  pin_try_exceeded: 'Incorrect PIN',
}

export function aggregateFailedPayments(payments: PaymentEventRow[], timeRange: StatsTimeRange, range?: DateRange): FailedPaymentData {
  const { since } = range ?? computeDateRange(timeRange)

  const inCurrent = (d: string) => !since || new Date(d) >= since
  const inPrior = (d: string) => {
    if (!since) return false
    const priorStart = new Date(since)
    priorStart.setDate(priorStart.getDate() - daysForRange(timeRange))
    const dt = new Date(d)
    return dt >= priorStart && dt < since
  }

  const currentFailed = payments.filter(p => p.status === 'failed' && inCurrent(p.created_at))
  const priorFailed = payments.filter(p => p.status === 'failed' && inPrior(p.created_at))

  const totalAmountCents = currentFailed.reduce((s, p) => s + p.amount_cents, 0)
  const priorAmountCents = priorFailed.reduce((s, p) => s + p.amount_cents, 0)

  // Group by failure_reason
  const byReason = new Map<string, { count: number; amountCents: number }>()
  for (const p of currentFailed) {
    const reason = p.failure_reason ?? 'unknown'
    const entry = byReason.get(reason) ?? { count: 0, amountCents: 0 }
    entry.count++
    entry.amountCents += p.amount_cents
    byReason.set(reason, entry)
  }

  const rows: FailedPaymentSummary[] = [...byReason.entries()]
    .sort((a, b) => b[1].amountCents - a[1].amountCents)
    .map(([reason, data]) => ({
      label: FAILURE_REASON_LABELS[reason] ?? capitalize(reason).replace(/_/g, ' '),
      count: data.count,
      amount: formatCurrency(data.amountCents),
      amountCents: data.amountCents,
    }))

  return {
    totalAmount: formatCurrency(totalAmountCents),
    totalAmountCents,
    totalCount: currentFailed.length,
    trend: timeRange !== 'all' ? computeTrend(totalAmountCents, priorAmountCents) : undefined,
    rows,
  }
}

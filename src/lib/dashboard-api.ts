import { supabase } from './supabase'
import { getGymId, getGymTimezone } from './members-api'
import { computeDateRange } from './dashboard-aggregations'
import type { MemberSummaryRow, PaymentEventRow, CheckInEventRow, RecentCheckInRow } from './dashboard-aggregations'
import type { StatsTimeRange } from '../context/MembersContext'

interface QueryResult<T> {
  status: 'fulfilled' | 'rejected'
  data?: T
  error?: Error
}

export interface DashboardRawData {
  members: QueryResult<MemberSummaryRow[]>
  payments: QueryResult<PaymentEventRow[]>
  checkIns: QueryResult<CheckInEventRow[]>
  recentCheckIns: QueryResult<RecentCheckInRow[]>
  timezone: string
}

async function fetchMembersSummary(gymId: string, signal?: AbortSignal): Promise<MemberSummaryRow[]> {
  let query = supabase
    .from('members')
    .select('status, joined_at')
    .eq('gym_id', gymId)

  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query
  if (error) throw new Error(`Members query failed: ${error.message}`)
  return (data ?? []) as MemberSummaryRow[]
}

async function fetchPaymentEvents(gymId: string, since: Date | null, signal?: AbortSignal): Promise<PaymentEventRow[]> {
  let query = supabase
    .from('payment_events')
    .select('amount_cents, status, created_at, event_type')
    .eq('gym_id', gymId)

  if (since) query = query.gte('created_at', since.toISOString())
  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query
  if (error) throw new Error(`Payments query failed: ${error.message}`)
  return (data ?? []) as PaymentEventRow[]
}

async function fetchCheckInEvents(gymId: string, since: Date | null, signal?: AbortSignal): Promise<CheckInEventRow[]> {
  let query = supabase
    .from('access_events')
    .select('scanned_at')
    .eq('gym_id', gymId)
    .eq('result', 'granted')

  if (since) query = query.gte('scanned_at', since.toISOString())
  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query
  if (error) throw new Error(`Check-ins query failed: ${error.message}`)
  return (data ?? []) as CheckInEventRow[]
}

async function fetchRecentCheckIns(gymId: string, limit: number, signal?: AbortSignal): Promise<RecentCheckInRow[]> {
  let query = supabase
    .from('access_events')
    .select('id, scanned_at, members(full_name, avatar_url, status, billing_status, subscriptions(membership_plans(name)))')
    .eq('gym_id', gymId)
    .eq('result', 'granted')
    .order('scanned_at', { ascending: false })
    .limit(limit)

  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query
  if (error) throw new Error(`Recent check-ins query failed: ${error.message}`)
  return (data ?? []) as unknown as RecentCheckInRow[]
}

function processResult<T>(result: PromiseSettledResult<T>): QueryResult<T> {
  if (result.status === 'fulfilled') {
    return { status: 'fulfilled', data: result.value }
  }
  const err = result.reason
  if (err?.name === 'AbortError') {
    return { status: 'rejected' }
  }
  return { status: 'rejected', error: err instanceof Error ? err : new Error(String(err)) }
}

export async function fetchDashboardData(timeRange: StatsTimeRange, signal?: AbortSignal): Promise<DashboardRawData> {
  const [gymId, timezone] = await Promise.all([getGymId(), getGymTimezone()])

  const { extendedSince } = computeDateRange(timeRange)

  const results = await Promise.allSettled([
    fetchMembersSummary(gymId, signal),
    fetchPaymentEvents(gymId, extendedSince, signal),
    fetchCheckInEvents(gymId, extendedSince, signal),
    fetchRecentCheckIns(gymId, 20, signal),
  ])

  return {
    members: processResult(results[0]),
    payments: processResult(results[1]),
    checkIns: processResult(results[2]),
    recentCheckIns: processResult(results[3]),
    timezone,
  }
}
